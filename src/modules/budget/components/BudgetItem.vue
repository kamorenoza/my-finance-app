<template>
  <div class="budget-item" :class="{ paid: entry.isPaid }">
    <div class="budget-item__content">
      <div class="budget-item__info">
        <p class="budget-item__name">{{ entry.name }}</p>
        <p class="budget-item__category">{{ entry.category }}</p>
      </div>
      <div class="budget-item__amount" :class="entry.type">
        {{ currency(entry.value) }}
      </div>
    </div>
    <div class="budget-item__status" :class="entry.type">
      <span v-if="entry.isPaid" class="badge paid">Pagado</span>
      <span v-else class="badge pending">Pendiente</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BudgetEntry } from '../budget.interface'

defineProps<{
  entry: BudgetEntry
}>()

const currency = (value: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value)
</script>

<style scoped lang="scss">
.budget-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background-color: #f8f8f8;
  border-radius: 12px;
  margin-bottom: 8px;
  border-left: 4px solid #388e3c;

  &.paid {
    opacity: 0.7;
  }

  &__content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex: 1;
    gap: 15px;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__name {
    font-family: $font-medium;
    font-size: 0.95rem;
    color: #333;
    margin: 0;
  }

  &__category {
    font-size: 0.8rem;
    color: #888;
    margin: 0;
  }

  &__amount {
    font-family: $font-medium;
    font-size: 0.95rem;
    color: #388e3c;

    &.gasto {
      color: #d32f2f;
    }
  }

  &__status {
    display: flex;
    gap: 8px;

    .badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;

      &.paid {
        background-color: #e8f5e9;
        color: #388e3c;
      }

      &.pending {
        background-color: #fff3e0;
        color: #f57c00;
      }
    }
  }
}
</style>
