<template>
  <v-card class="shopping-item">
    <v-card-text class="shopping-item__content">
      <div class="shopping-item__main">
        <v-checkbox
          :model-value="item.checked"
          @update:model-value="$emit('toggleChecked', item.id)"
          hide-details
          density="compact"
          class="shopping-item__checkbox"
        />
        <div class="shopping-item__info">
          <div
            class="shopping-item__name"
            :class="{ 'shopping-item__name--checked': item.checked }"
          >
            {{ item.name }}
          </div>
          <div class="shopping-item__amounts">
            <span class="shopping-item__label">Estimado:</span>
            <span class="shopping-item__value">{{
              currency(item.estimatedAmount)
            }}</span>
            <span
              v-if="item.realAmount > 0"
              class="shopping-item__label shopping-item__label--real"
            >
              Real:
            </span>
            <span
              v-if="item.realAmount > 0"
              class="shopping-item__value shopping-item__value--real"
            >
              {{ currency(item.realAmount) }}
            </span>
          </div>
        </div>
      </div>
      <div class="shopping-item__actions">
        <v-btn icon size="small" variant="text" @click="$emit('edit', item)">
          <v-icon size="20">mdi-pencil</v-icon>
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { ShoppingItem } from '../shopping.interface'

interface Props {
  item: ShoppingItem
}

defineProps<Props>()

defineEmits<{
  edit: [item: ShoppingItem]
  toggleChecked: [id: string]
}>()

const currency = (value: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value)
</script>

<style scoped lang="scss">
.shopping-item {
  margin-bottom: 12px;
  border-radius: 18px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12) !important;
  }

  &__content {
    padding: 12px 16px !important;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__main {
    display: flex;
    align-items: center;
    flex: 1;
    gap: 8px;
  }

  &__checkbox {
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 0.95rem;
    font-family: $font-medium;
    color: $text-gray;
    margin-bottom: 4px;
    transition: all 0.2s ease;

    &--checked {
      text-decoration: line-through;
      color: $text-gray-md;
    }
  }

  &__amounts {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  &__label {
    font-size: 0.75rem;
    color: $text-gray-md;

    &--real {
      margin-left: 8px;
    }
  }

  &__value {
    font-size: 0.85rem;
    font-family: $font-medium;
    color: $blue;

    &--real {
      color: $green;
    }
  }

  &__actions {
    flex-shrink: 0;
    margin-left: 8px;
  }
}
</style>
