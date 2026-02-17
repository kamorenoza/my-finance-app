<template>
  <div class="shopping">
    <div class="general-header">
      <p class="general-title">Listas de compras</p>
    </div>

    <div class="shopping__content">
      <div class="shopping__stats">
        <v-card class="shopping__stat-card">
          <v-card-text>
            <div class="stat-label">Listas activas</div>
            <div class="stat-value">{{ unconvertedCount }}</div>
          </v-card-text>
        </v-card>
        <v-card class="shopping__stat-card">
          <v-card-text>
            <div class="stat-label">Total items</div>
            <div class="stat-value">{{ totalItems }}</div>
          </v-card-text>
        </v-card>
      </div>

      <div class="shopping__lists">
        <EmptyState
          v-if="shoppingStore.shoppingLists.length === 0"
          message="No hay listas de compras"
        />
        <div v-else>
          <!-- Listas no convertidas -->
          <div v-if="unconvertedLists.length > 0" class="shopping__section">
            <h3 class="shopping__section-title">Activas</h3>
            <ShoppingListItem
              v-for="list in unconvertedLists"
              :key="list.id"
              :shopping-list="list"
              @open="handleOpen"
            />
          </div>

          <!-- Listas convertidas -->
          <div v-if="convertedLists.length > 0" class="shopping__section">
            <h3 class="shopping__section-title">Convertidas a gastos</h3>
            <ShoppingListItem
              v-for="list in convertedLists"
              :key="list.id"
              :shopping-list="list"
              @open="handleOpen"
            />
          </div>
        </div>
      </div>
    </div>

    <AddShoppingList ref="addShoppingRef" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useShoppingStore } from './shopping.store'
import type { ShoppingList } from './shopping.interface'
import ShoppingListItem from './components/ShoppingListItem.vue'
import AddShoppingList from './components/AddShoppingList.vue'
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

const handleOpen = (list: ShoppingList) => {
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
  }

  &__content {
    padding: 16px;

    @media (min-width: 960px) {
      max-width: 800px;
      margin: 0 auto;
    }
  }

  &__stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 20px;
  }

  &__stat-card {
    background: $blue !important;
    border-radius: 18px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    .stat-label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 18px;
      font-family: $font-medium;
      color: white;
    }
  }

  &__lists {
    margin-top: 20px;
  }

  &__section {
    margin-bottom: 24px;

    &-title {
      font-size: 0.9rem;
      font-family: $font-medium;
      color: $text-gray-md;
      margin: 0 0 12px 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
}
</style>
