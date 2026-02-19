<template>
  <div class="shopping-item">
    <div class="shopping-item__content">
      <v-icon v-if="dragMode" class="drag-handle" size="20"
        >mdi-drag-vertical</v-icon
      >
      <div class="shopping-item__main">
        <button
          class="shopping-item__checkbox"
          :class="{ 'shopping-item__checkbox--checked': item.checked }"
          @click.stop="$emit('toggleChecked', item.id)"
        >
          <v-icon v-if="item.checked" size="16" color="white">mdi-check</v-icon>
        </button>
        <div class="shopping-item__info">
          <div
            class="shopping-item__name"
            :class="{ 'shopping-item__name--checked': item.checked }"
          >
            <p>
              {{ item.name }}
              <span class="shopping-item__value">
                {{ currency(item.amount) }}
              </span>
            </p>
          </div>
        </div>
      </div>
      <div class="shopping-item__actions">
        <v-btn
          class="shopping-item__edit-btn"
          variant="text"
          @click.stop="$emit('edit', item)"
        >
          <EditIcon />
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShoppingItem } from '../shopping.interface'
import EditIcon from '@/assets/icons/Edit.icon.vue'

interface Props {
  item: ShoppingItem
  dragMode?: boolean
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
  transition: all 0.2s ease;
  box-shadow: none !important;

  &__content {
    padding: 0 2px !important;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .drag-handle {
    flex-shrink: 0;
    color: #c8c8c8;
    cursor: grab;
    margin-right: 2px;
    &:active {
      cursor: grabbing;
    }
  }
  &__main {
    display: flex;
    align-items: center;
    flex: 1;
    gap: 8px;
  }

  &__checkbox {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1px solid #c8c8c8;
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;

    &--checked {
      background-color: rgba($color-primary, 0.6);
      border-color: transparent !important;
    }
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 0.95rem;
    font-family: $font-medium;
    color: $text-gray;
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
    padding-left: 5px;

    &--real {
      color: $green;
    }
  }

  &__actions {
    flex-shrink: 0;
    margin-left: 8px;
  }

  &__edit-btn {
    background-color: $color-lg-primary;
    height: 32px !important;
    width: 32px !important;
    border-radius: 12px !important;
    padding: 0 !important;
    min-width: 0 !important;

    .icon {
      width: 23px !important;
      height: 23px !important;
    }
  }
}
</style>
