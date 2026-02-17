<template>
  <div class="list-detail">
    <!-- Header -->
    <div class="list-detail__header">
      <v-btn
        icon
        size="small"
        variant="text"
        @click="goBack"
        class="list-detail__back"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <div class="list-detail__title-section">
        <h2 class="list-detail__title">{{ list?.name }}</h2>
        <p class="list-detail__date">{{ formattedDate }}</p>
      </div>
      <v-btn icon size="small" variant="text" @click="openEditList">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
    </div>

    <!-- Stats -->
    <div class="list-detail__stats">
      <div class="stat-item">
        <span class="stat-label">Items</span>
        <span class="stat-value">{{ list?.items.length || 0 }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Completados</span>
        <span class="stat-value">{{ completedCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Estimado</span>
        <span class="stat-value">{{ currency(totalEstimated) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Real</span>
        <span class="stat-value">{{ currency(totalReal) }}</span>
      </div>
    </div>

    <!-- Items list -->
    <div class="list-detail__items">
      <AddShoppingItemInline @save="handleAddItemInline" />

      <EmptyState
        v-if="!list || list.items.length === 0"
        message="No hay artículos en esta lista"
      />
      <ShoppingItemCard
        v-for="item in list?.items"
        :key="item.id"
        :item="item"
        @edit="handleEditItem"
        @toggleChecked="handleToggleChecked"
      />
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
import EmptyState from '@/modules/shared/components/EmptyState.vue'
import { generateId, dateFormatter } from '@/modules/shared/utils'
import { useToastStore } from '@/modules/shared/toast/toast.store'

const router = useRouter()
const route = useRoute()
const shoppingStore = useShoppingStore()
const toast = useToastStore()

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

const currency = (value: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value)

onMounted(() => {
  if (!list.value) {
    toast.error('Lista no encontrada')
    router.push('/compras')
  }
})
</script>

<style scoped lang="scss">
.list-detail {
  padding: 16px;
  position: relative;
  min-height: calc(100vh - 95px);

  @media (min-width: 960px) {
    max-width: 800px;
    margin: 0 auto;
  }

  &__header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 20px;
  }

  &__back {
    flex-shrink: 0;
  }

  &__title-section {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 1.25rem;
    font-family: $font-medium;
    color: $text-gray;
    margin: 0 0 4px;
  }

  &__date {
    font-size: 0.85rem;
    color: $text-gray-md;
    margin: 0;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 24px;

    @media (min-width: 600px) {
      grid-template-columns: repeat(4, 1fr);
    }

    .stat-item {
      background: $white;
      border-radius: 18px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .stat-label {
      font-size: 0.75rem;
      color: $text-gray-md;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      font-size: 1.1rem;
      font-family: $font-medium;
      color: $blue;
    }
  }

  &__items {
    margin-bottom: 80px;
  }
}
</style>
