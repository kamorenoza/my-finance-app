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
        :total-list="totalEstimated"
        :total-completed="totalReal"
      />

      <!-- Items list -->
      <div class="list-detail__items">
        <AddShoppingItemInline @save="handleAddItemInline" />

        <EmptyState
          v-if="!list || list.items.length === 0"
          message="No hay artículos en esta lista"
        />

        <div class="list-detail__scroll" v-else>
          <ShoppingItemCard
            v-for="item in list?.items"
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
import { ref, computed, onMounted } from 'vue'
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

const totalEstimated = computed(() => {
  if (!list.value) return 0
  return list.value.items.reduce(
    (sum: number, item: ShoppingItem) => sum + item.estimatedAmount,
    0
  )
})

const totalReal = computed(() => {
  if (!list.value) return 0
  return list.value.items.reduce(
    (sum: number, item: ShoppingItem) => sum + item.realAmount,
    0
  )
})

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
    estimatedAmount: amount,
    realAmount: 0,
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
      left: 40px;
      top: 53px;
    }
  }

  &__items {
    margin-bottom: 80px;
    padding: 0 0 40px;

    @media (min-width: 960px) {
      flex-grow: 1;
      margin-top: 25px;
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

  &__scroll {
  }
}
</style>
