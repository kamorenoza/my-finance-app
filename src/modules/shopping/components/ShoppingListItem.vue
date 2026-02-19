<template>
  <div class="shopping-list-card" @click="openList">
    <div class="shopping-list-card__content">
      <div class="shopping-list-card__info">
        <p class="shopping-list-card__name">{{ shoppingList.name }}</p>
        <div class="shopping-list-card__meta">
          <span v-if="total > 0" class="shopping-list-card__items">
            Total: {{ currencyFormatter(total) }}
          </span>
        </div>
      </div>
      <div class="shopping-list-card__badges">
        <span v-if="shoppingList.converted" class="badge converted">
          Convertido
        </span>
        <span v-if="completedItems > 0" class="badge progress">
          {{ completedItems }}/{{ shoppingList.items.length }}
        </span>
      </div>
    </div>
    <div class="shopping-list-card__actions">
      <v-icon size="24" color="#6faeaa">mdi-chevron-right</v-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ShoppingList } from '../shopping.interface'
import { currencyFormatter } from '@/modules/shared/utils'

interface Props {
  shoppingList: ShoppingList
}

const props = defineProps<Props>()

const emit = defineEmits<{
  open: [list: ShoppingList]
}>()

const openList = () => {
  emit('open', props.shoppingList)
}

const pendingCount = computed(() => {
  return props.shoppingList.items.filter(item => !item.checked).length
})

const completedItems = computed(() => {
  return props.shoppingList.items.filter(item => item.checked).length
})

const total = computed(() => {
  return props.shoppingList.items
    .filter(item => !item.checked)
    .reduce(
      (sum, item) =>
        sum + ((item.amount ?? (item as any).estimatedAmount) || 0),
      0
    )
})
</script>

<style scoped lang="scss">
@import '@/styles/_variables.scss';

.shopping-list-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 16px;
  background-color: $bg-item;
  border-radius: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: darken($bg-item, 2%);
  }

  &__content {
    display: flex;
    align-items: center;
    flex: 1;
    gap: 12px;
    min-width: 0;
  }

  &__info {
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 4px;
    flex: 1;
  }

  &__name {
    font-family: $font-medium;
    font-size: 1rem;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__meta {
    display: flex;
    gap: 12px;
    font-size: 0.8rem;
    color: $text-gray-md;
    font-family: $font-medium;
  }

  &__date,
  &__items {
    display: flex;
    align-items: center;
  }

  &__amounts {
    display: flex;
    gap: 12px;
    font-size: 0.9rem;
  }

  &__estimated {
    color: $text-gray-md;
  }

  &__real {
    color: $color-primary;
    font-family: $font-medium;
  }

  &__badges {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: flex-end;
    flex-shrink: 0;
  }

  &__actions {
    flex-shrink: 0;
    margin-left: 8px;
  }
}

.badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.65rem;
  font-weight: 500;
  white-space: nowrap;

  &.converted {
    background-color: #c8e6c9;
    color: #2e7d32;
  }

  &.progress {
    background-color: $blue-md;
    color: $blue;
    font-family: $font-medium;
  }
}
</style>
