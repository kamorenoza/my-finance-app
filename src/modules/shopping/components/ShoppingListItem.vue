<template>
  <div class="shopping-list-card" @click="openList">
    <div class="shopping-list-card__content">
      <div class="shopping-list-card__info">
        <p class="shopping-list-card__name">{{ shoppingList.name }}</p>
        <div class="shopping-list-card__meta">
          <span class="shopping-list-card__date">
            {{ formattedDate }}
          </span>
          <span class="shopping-list-card__items">
            {{ itemsCount }} items
          </span>
        </div>
        <div v-if="totalEstimated > 0" class="shopping-list-card__amounts">
          <span class="shopping-list-card__estimated">
            Est: {{ currency(totalEstimated) }}
          </span>
          <span v-if="totalReal > 0" class="shopping-list-card__real">
            Real: {{ currency(totalReal) }}
          </span>
        </div>
      </div>
      <div class="shopping-list-card__badges">
        <span v-if="shoppingList.converted" class="badge converted">
          Convertido
        </span>
        <span v-if="completedItems > 0" class="badge progress">
          {{ completedItems }}/{{ itemsCount }}
        </span>
      </div>
    </div>
    <div class="shopping-list-card__actions">
      <v-icon size="24" color="primary">mdi-chevron-right</v-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ShoppingList } from '../shopping.interface'
import { dateFormatter } from '@/modules/shared/utils'

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

const formattedDate = computed(() => {
  return dateFormatter(props.shoppingList.createdDate)
})

const itemsCount = computed(() => {
  return props.shoppingList.items.length
})

const completedItems = computed(() => {
  return props.shoppingList.items.filter(item => item.checked).length
})

const totalEstimated = computed(() => {
  return props.shoppingList.items.reduce(
    (sum, item) => sum + item.estimatedAmount,
    0
  )
})

const totalReal = computed(() => {
  return props.shoppingList.items.reduce(
    (sum, item) => sum + item.realAmount,
    0
  )
})

const currency = (value: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value)
</script>

<style scoped lang="scss">
@import '@/styles/_variables.scss';

.shopping-list-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: $bg-item;
  border-radius: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: darken($bg-item, 2%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
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
    gap: 6px;
    min-width: 0;
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
    font-size: 0.75rem;
    color: $text-gray-md;
  }

  &__date,
  &__items {
    display: flex;
    align-items: center;
  }

  &__amounts {
    display: flex;
    gap: 12px;
    font-size: 0.8rem;
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
