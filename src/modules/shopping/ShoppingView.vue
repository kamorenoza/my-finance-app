<template>
  <div class="shopping">
    <PageHeader title="Listas de compras" />

    <div class="shopping__content">
      <div class="shopping__summary-content">
        <ShoppingSummary
          :unconverted-count="unconvertedCount"
          :total-items="totalItems"
        />
      </div>

      <div class="shopping__lists">
        <EmptyState
          v-if="shoppingStore.shoppingLists.length === 0"
          message="No hay listas de compras"
        />
        <ShoppingList
          v-else
          :unconverted-lists="unconvertedLists"
          :converted-lists="convertedLists"
          @open="handleOpen"
        />
      </div>
    </div>

    <AddShoppingList ref="addShoppingRef" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useShoppingStore } from './shopping.store'
import type { ShoppingList as ShoppingListType } from './shopping.interface'
import AddShoppingList from './components/AddShoppingList.vue'
import ShoppingSummary from './components/ShoppingSummary.vue'
import ShoppingList from './components/ShoppingList.vue'
import PageHeader from '../shared/components/PageHeader.vue'
import EmptyState from '@/modules/shared/components/EmptyState.vue'

const router = useRouter()
const shoppingStore = useShoppingStore()

const unconvertedLists = computed(() => shoppingStore.unconvertedLists)
const convertedLists = computed(() => shoppingStore.convertedLists)

const unconvertedCount = computed(() => unconvertedLists.value.length)

const totalItems = computed(() => {
  return shoppingStore.shoppingLists.reduce(
    (sum, list) => sum + list.items.length,
    0
  )
})

const handleOpen = (list: ShoppingListType) => {
  router.push(`/compras/${list.id}`)
}
</script>

<style lang="scss" scoped>
.shopping {
  padding-left: 0;
  position: relative;
  height: calc(100vh - 95px);

  @media (min-width: 960px) {
    padding-left: 20px;
    padding-right: 8px;
  }

  &__content {
    padding: 0 15px 40px;

    @media (min-width: 960px) {
      display: flex;
      gap: 25px;
      padding-left: 0;
    }
  }

  &__summary-content {
    @media (min-width: 960px) {
      width: 250px;
      flex-shrink: 0;
    }
  }

  &__lists {
    margin-top: 20px;

    @media (min-width: 960px) {
      flex-grow: 1;
      margin-top: 0;
    }
  }
}
</style>
