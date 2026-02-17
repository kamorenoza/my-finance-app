<template>
  <div>
    <!-- Listas no convertidas -->
    <div v-if="unconvertedLists.length > 0" class="shopping-list__section">
      <h3 class="shopping-list__section-title">Activas</h3>
      <ShoppingListItem
        v-for="list in unconvertedLists"
        :key="list.id"
        :shopping-list="list"
        @open="$emit('open', list)"
      />
    </div>

    <!-- Listas convertidas -->
    <div v-if="convertedLists.length > 0" class="shopping-list__section">
      <h3 class="shopping-list__section-title">Convertidas a gastos</h3>
      <ShoppingListItem
        v-for="list in convertedLists"
        :key="list.id"
        :shopping-list="list"
        @open="$emit('open', list)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShoppingList as ShoppingListType } from '../shopping.interface'
import ShoppingListItem from './ShoppingListItem.vue'

interface Props {
  unconvertedLists: ShoppingListType[]
  convertedLists: ShoppingListType[]
}

interface Emits {
  (e: 'open', list: ShoppingListType): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style lang="scss" scoped>
.shopping-list__section {
  margin-bottom: 24px;

  &-title {
    font-size: 0.9rem;
    font-family: $font-medium;
    color: $text-gray-md;
    margin: 0 0 12px 4px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
}
</style>
