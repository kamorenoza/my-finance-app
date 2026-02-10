<template>
  <div class="budget-item" :class="{ paid: displayIsPaid }">
    <div>
      <div
        v-bind="props"
        icon
        class="budget-item__category"
        :style="{
          backgroundColor: entry?.category?.backgroundColor || '#9e9e9e'
        }"
      >
        <component
          :is="getIcon(entry.category?.icon || '')"
          :color="colorWhite"
        />
      </div>
    </div>

    <div class="budget-item__content">
      <div class="budget-item__info">
        <div class="budget-item__header">
          <p class="budget-item__name">{{ displayName }}</p>
          <span v-if="displayIsPaid" class="badge paid" @click="togglePaid"
            >Pagado</span
          >
          <span v-else class="badge pending" @click="togglePaid"
            >Pendiente</span
          >
        </div>
        <p v-date-formatter="entry.date" class="budget-item__date"></p>
        <p class="budget-item__comments">{{ entry.comments }}</p>
      </div>
      <div>
        <div class="budget-item__amount" :class="entry.type">
          {{ currency(displayValue) }}
        </div>
      </div>
    </div>

    <div class="budget-item__actions">
      <v-btn
        icon
        variant="plain"
        v-bind="props"
        :ripple="false"
        class="btn-label budget-item__edit"
        @click="editEntry"
      >
        <slot>
          <v-icon size="24">mdi-chevron-right</v-icon>
        </slot>
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BudgetEntry } from '../budget.interface'
import dayjs from 'dayjs'
import { colorWhite } from '@/styles/variables.styles'
import { getIcon } from '@/modules/categories/categories.constants'
import { useConfirm } from '@/modules/shared/composables/useConfirm'
import { useBudgetStore } from '../budget.store'

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

const budgetStore = useBudgetStore()
const confirm = useConfirm()

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

// Calcular el isPaid actual considerando modificaciones
const displayIsPaid = computed(() => {
  const month = dayjs(props.referenceDate).format('YYYY-MM')

  // Buscar si hay una modificación en este mes con un nuevo isPaid
  const modification = props.entry.modifications?.find(m => m.month === month)

  if (modification && modification.isPaid !== undefined) {
    return modification.isPaid
  }

  // Si no hay modificación, usar el isPaid base
  return props.entry.isPaid
})

const editEntry = () => {
  emit('edit', props.entry)
}

const togglePaid = async () => {
  const newIsPaidState = !displayIsPaid.value
  const action = newIsPaidState ? 'pagado' : 'pendiente'
  const confirmed = await confirm({
    title: `Marcar como ${action}`,
    message: `¿Deseas marcar este movimiento como ${action}?`
  })

  if (confirmed) {
    budgetStore.updateEntryIsPaidForMonth(props.entry.id, newIsPaidState)
  }
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
  padding: 12px 30px 12px 12px;
  background-color: #f8f8f8;
  border-radius: 12px;
  margin-bottom: 8px;
  position: relative;

  &.paid {
    opacity: 0.7;
  }

  &__content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex: 1;
    gap: 15px;
    min-width: 0;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 5px;
    min-width: 0;
  }

  &__name {
    font-family: $font-medium;
    font-size: 0.9rem;
    margin: 0;
    flex-shrink: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }

  &__category {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    margin-right: 7px;
    flex-shrink: 0;

    .icon {
      width: 23px;
      height: 23px;
    }
  }

  &__amount {
    font-family: $font-medium;
    font-size: 0.9rem;
    color: #388e3c;
    white-space: nowrap;
    flex-shrink: 0;

    &.gasto {
      color: #d32f2f;
    }
  }

  &__actions {
    position: absolute;
    top: 48%;
    right: -8px;
    transform: translateY(-50%);
    flex-shrink: 0;
  }

  &__date {
    font-size: 0.7rem;
    line-height: 0.8rem;
    color: $text-gray-md;
    margin: 0;
  }

  &__comments {
    font-size: 0.7rem;
    color: $text-gray-md;
    margin: 0;
  }
}

.badge {
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.6rem;
  font-weight: 500;
  display: inline-block;
  white-space: nowrap;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.2s ease;

  &.paid {
    background-color: #e8f5e9;
    color: #388e3c;

    &:hover {
      background-color: #c8e6c9;
    }
  }

  &.pending {
    background-color: #fff3e0;
    color: #f57c00;

    &:hover {
      background-color: #ffe0b2;
    }
  }
}
</style>
