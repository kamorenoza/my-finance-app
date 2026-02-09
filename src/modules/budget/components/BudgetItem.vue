<template>
  <div class="budget-item" :class="{ paid: entry.isPaid }">
    <div class="budget-item__content">
      <div class="budget-item__info">
        <p class="budget-item__name">{{ displayName }}</p>
        <p class="budget-item__category">{{ entry.category }}</p>
      </div>
      <div class="budget-item__amount" :class="entry.type">
        {{ currency(displayValue) }}
      </div>
    </div>
    <div class="budget-item__status" :class="entry.type">
      <span v-if="entry.isPaid" class="badge paid">Pagado</span>
      <span v-else class="badge pending">Pendiente</span>
    </div>
    <v-btn
      icon
      density="compact"
      class="budget-item__action"
      @click="editEntry"
    >
      <v-icon size="24">mdi-chevron-right</v-icon>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BudgetEntry } from '../budget.interface'
import dayjs from 'dayjs'

interface Props {
  entry: BudgetEntry
  referenceDate?: Date
}

const props = withDefaults(defineProps<Props>(), {
  referenceDate: () => new Date()
})

const emit = defineEmits<{
  edit: [entry: BudgetEntry]
}>()

// Calcular el valor actual considerando modificaciones
const displayValue = computed(() => {
  const month = dayjs(props.referenceDate).format('YYYY-MM')

  // Buscar si hay una modificación en este mes con un nuevo valor
  const modification = props.entry.modifications?.find(m => m.month === month)

  if (modification && modification.value !== undefined) {
    return modification.value
  }

  // Si no hay modificación, usar el valor base
  return props.entry.value
})

// Calcular el nombre actual considerando modificaciones
const displayName = computed(() => {
  const month = dayjs(props.referenceDate).format('YYYY-MM')

  // Buscar si hay una modificación en este mes con un nuevo nombre
  const modification = props.entry.modifications?.find(m => m.month === month)

  if (modification && modification.name !== undefined) {
    return modification.name
  }

  // Si no hay modificación, usar el nombre base
  return props.entry.name
})

const editEntry = () => {
  emit('edit', props.entry)
}

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

  &__action {
    flex-shrink: 0;
    margin-left: auto;
  }
}
</style>
