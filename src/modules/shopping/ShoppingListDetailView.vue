<template>
  <div class="list-detail">
    <!-- Header -->
    <PageHeader :title="list?.name" show-back @back="goBack">
      <template #actions>
        <v-btn
          class="list-detail__action"
          size="small"
          variant="text"
          @click="openEditList"
        >
          <EditIcon />
        </v-btn>
        <v-btn
          class="list-detail__action delete"
          size="small"
          variant="text"
          @click="handleDeleteList"
        >
          <TrashIcon />
        </v-btn>
      </template>
    </PageHeader>

    <span class="list-detail__date">{{ formattedDate }}</span>
    <div class="list-detail__content">
      <!-- Stats -->
      <ShoppingStats
        :total-items="list?.items.length || 0"
        :completed-count="completedCount"
        :total-list="totalPending"
        :total-completed="totalCompleted"
      />

      <!-- Items list -->
      <div class="list-detail__items">
        <AddShoppingItemInline @save="handleAddItemInline" />

        <div v-if="list && list.items.length > 0" class="list-detail__toolbar">
          <button
            class="list-detail__reorder-btn"
            :class="{ 'list-detail__reorder-btn--active': reorderMode }"
            @click="reorderMode = !reorderMode"
          >
            <v-icon size="16">mdi-swap-vertical</v-icon>
            {{ reorderMode ? 'Listo' : 'Reorganizar' }}
          </button>
        </div>

        <EmptyState
          v-if="!list || list.items.length === 0"
          message="No hay artículos en esta lista"
        />

        <div class="list-detail__scroll" v-else>
          <draggable
            :list="pendingItems"
            item-key="id"
            handle=".drag-handle"
            @end="handleReorder"
            ghost-class="drag-ghost"
          >
            <template #item="{ element }">
              <ShoppingItemCard
                :key="element.id"
                :item="element"
                :drag-mode="reorderMode"
                @edit="handleEditItem"
                @toggleChecked="handleToggleChecked"
              />
            </template>
          </draggable>
          <ShoppingItemCard
            v-for="item in checkedItems"
            :key="item.id"
            :item="item"
            @edit="handleEditItem"
            @toggleChecked="handleToggleChecked"
          />
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AddShoppingItem
      ref="addItemRef"
      :list-id="listId"
      @save="handleSaveItem"
      @delete="handleDeleteItem"
    />

    <AddShoppingList ref="editListRef" :show-fab="false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useShoppingStore } from '@/modules/shopping/shopping.store'
import type {
  ShoppingItem,
  ShoppingList
} from '@/modules/shopping/shopping.interface'
import ShoppingItemCard from '@/modules/shopping/components/ShoppingItemCard.vue'
import AddShoppingItem from '@/modules/shopping/components/AddShoppingItem.vue'
import AddShoppingItemInline from '@/modules/shopping/components/AddShoppingItemInline.vue'
import AddShoppingList from '@/modules/shopping/components/AddShoppingList.vue'
import ShoppingStats from '@/modules/shopping/components/ShoppingStats.vue'
import PageHeader from '../shared/components/PageHeader.vue'
import EmptyState from '@/modules/shared/components/EmptyState.vue'
import draggable from 'vuedraggable'
import { generateId, dateFormatter } from '@/modules/shared/utils'
import { useToastStore } from '@/modules/shared/toast/toast.store'
import { useConfirm } from '@/modules/shared/composables/useConfirm'
import EditIcon from '@/assets/icons/Edit.icon.vue'
import TrashIcon from '@/assets/icons/Trash.icon.vue'

const router = useRouter()
const route = useRoute()
const shoppingStore = useShoppingStore()
const toast = useToastStore()
const confirm = useConfirm()

const addItemRef = ref()
const editListRef = ref()
const reorderMode = ref(false)

const listId = computed(() => route.params.id as string)

const list = computed(() =>
  shoppingStore.shoppingLists.find((l: ShoppingList) => l.id === listId.value)
)

const formattedDate = computed(() => {
  if (!list.value) return ''
  return dateFormatter(list.value.createdDate)
})

const completedCount = computed(() => {
  if (!list.value) return 0
  return list.value.items.filter((item: ShoppingItem) => item.checked).length
})

const totalPending = computed(() => {
  if (!list.value) return 0
  return list.value.items
    .filter((item: ShoppingItem) => !item.checked)
    .reduce(
      (sum: number, item: ShoppingItem) =>
        sum + ((item.amount ?? (item as any).estimatedAmount) || 0),
      0
    )
})

const totalCompleted = computed(() => {
  if (!list.value) return 0
  return list.value.items
    .filter((item: ShoppingItem) => item.checked)
    .reduce(
      (sum: number, item: ShoppingItem) =>
        sum + ((item.amount ?? (item as any).estimatedAmount) || 0),
      0
    )
})

const pendingItems = ref<ShoppingItem[]>([])

watch(
  () => list.value?.items,
  items => {
    if (!items) return
    const incoming = items.filter((i: ShoppingItem) => !i.checked)
    const currentIds = pendingItems.value.map(i => i.id)
    const incomingIds = incoming.map(i => i.id)
    const sameSet =
      currentIds.length === incomingIds.length &&
      incomingIds.every(id => currentIds.includes(id))
    if (!sameSet) {
      pendingItems.value = incoming
    } else {
      // Update item data without changing order
      pendingItems.value = currentIds.map(
        id => incoming.find(i => i.id === id)!
      )
    }
  },
  { immediate: true, deep: true }
)

const checkedItems = computed<ShoppingItem[]>(() => {
  if (!list.value) return []
  return list.value.items
    .filter((i: ShoppingItem) => i.checked)
    .sort((a: ShoppingItem, b: ShoppingItem) => {
      const dateA = a.checkedAt ? new Date(a.checkedAt).getTime() : 0
      const dateB = b.checkedAt ? new Date(b.checkedAt).getTime() : 0
      return dateB - dateA
    })
})

const handleReorder = () => {
  shoppingStore.reorderItems(
    listId.value,
    pendingItems.value.map((i: ShoppingItem) => i.id)
  )
}

const goBack = () => {
  router.push('/compras')
}

const openEditList = () => {
  if (editListRef.value && list.value) {
    editListRef.value.openEditDialog(list.value)
  }
}

const handleEditItem = (item: ShoppingItem) => {
  if (addItemRef.value) {
    addItemRef.value.openEditDialog(item)
  }
}

const handleAddItemInline = (name: string, amount: number) => {
  const newItem: ShoppingItem = {
    id: generateId(),
    name,
    amount,
    checked: false,
    converted: false,
    expenseId: null
  }
  shoppingStore.addItemToList(listId.value, newItem)
  toast.success('Artículo agregado')
}

const handleSaveItem = (item: ShoppingItem) => {
  if (item.id) {
    // Update existing item
    shoppingStore.updateItemInList(listId.value, item)
    toast.success('Artículo actualizado')
  } else {
    // Add new item
    const newItem: ShoppingItem = {
      ...item,
      id: generateId()
    }
    shoppingStore.addItemToList(listId.value, newItem)
    toast.success('Artículo agregado')
  }
}

const handleDeleteItem = async (itemId: string) => {
  shoppingStore.deleteItemFromList(listId.value, itemId)
  toast.success('Artículo eliminado')
}

const handleToggleChecked = (itemId: string) => {
  shoppingStore.toggleItemChecked(listId.value, itemId)
}

const handleDeleteList = async () => {
  const confirmed = await confirm({
    title: 'Eliminar lista',
    message: `¿Estás seguro de que deseas eliminar la lista "${list.value?.name}"?`,
    confirmColor: 'red'
  })

  if (confirmed) {
    shoppingStore.deleteShoppingList(listId.value)
    toast.success('Lista eliminada')
    router.push('/compras')
  }
}

onMounted(() => {
  if (!list.value) {
    toast.error('Lista no encontrada')
    router.push('/compras')
  }
})
</script>

<style scoped lang="scss">
.list-detail {
  position: relative;
  min-height: calc(100vh - 95px);
  overflow-x: hidden;

  @media (min-width: 960px) {
    max-width: 950px;
  }

  &__date {
    font-size: 0.75rem;
    color: $text-gray-md;
    margin: 0;
    position: absolute;
    top: 48px;
    left: 45px;

    @media (min-width: 960px) {
      left: 45px;
      top: 47px;
    }
  }

  &__items {
    margin-bottom: 80px;
    padding: 0 15px 40px;

    @media (min-width: 960px) {
      flex-grow: 1;
      margin-top: 25px;
      padding: 0 0 40px;
    }
  }

  &__toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 8px;
  }

  &__reorder-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    font-family: $font-medium;
    color: $text-gray-md;
    background: transparent;
    border: 1px solid #e0e0e0;
    border-radius: 20px;
    padding: 4px 12px;
    cursor: pointer;
    transition: all 0.2s ease;

    &--active {
      color: $color-primary;
      border-color: $color-primary;
      background-color: rgba($color-md-primary, 0.08);
    }
  }

  &__action {
    background-color: $color-lg-primary;
    height: 40px;
    width: 40px;
    border-radius: 12px;
    padding: 0;
    min-width: 0;

    .icon {
      width: 26px !important;
      height: 26px !important;
    }

    &.delete {
      background-color: $red-md;
    }
  }

  &__content {
    @media (min-width: 960px) {
      display: flex;
      gap: 25px;
    }
  }
}

.drag-ghost {
  opacity: 0.4;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 18px;
}
</style>
