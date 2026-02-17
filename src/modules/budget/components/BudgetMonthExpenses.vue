<template>
  <div v-if="expenses.length > 0" class="month-expenses-group">
    <p
      class="budget-group__header budget-group__header--expenses mb-0"
      @click="$emit('toggleGroup', 'gastos-del-mes')"
    >
      <span class="month-expenses-toggle" @click.stop>
        <v-switch
          :model-value="addExpensesToBudget"
          color="success"
          hide-details
          density="compact"
          inset
          @update:model-value="$emit('update:addExpensesToBudget', !!$event)"
        />
      </span>
      <span class="budget-group__header-content">
        <span>Gastos del mes</span>
        <span class="budget-group__chevron">
          <v-icon size="17">
            {{ isExpanded === false ? 'mdi-chevron-down' : 'mdi-chevron-up' }}
          </v-icon>
        </span>
      </span>
      <span class="budget-group__total">{{ currency(total) }}</span>
    </p>
    <transition name="slide">
      <div v-show="isExpanded !== false" class="month-expenses-content">
        <div class="month-expenses-list">
          <ExpenseItem
            v-for="expense in expenses"
            :key="expense.id"
            :expense="expense"
            :read-only="true"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import type { Expense } from '@/modules/expenses/expenses.interface'
import ExpenseItem from '@/modules/expenses/components/ExpenseItem.vue'

interface Props {
  expenses: Expense[]
  total: number
  addExpensesToBudget: boolean
  isExpanded: boolean
}

interface Emits {
  (e: 'toggleGroup', groupName: string): void
  (e: 'update:addExpensesToBudget', value: boolean): void
}

defineProps<Props>()
defineEmits<Emits>()

const currency = (value: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value)
</script>

<style scoped lang="scss">
.month-expenses-group {
  margin-top: 10px;
  padding-top: 0px;
  border-top: 1px solid $bg-general;
}

.month-expenses-toggle {
  display: flex;
  align-items: center;
  margin-right: 8px;
  flex-shrink: 0;
}

.month-expenses-list {
  margin-top: 0px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
}

.budget-group {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 5px;
    border-radius: 12px;
    margin-bottom: 5px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    font-family: $font-medium;
    font-size: 0.9rem;
    color: #333;
    font-weight: normal;
    &-content {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }
  }

  &__chevron {
    display: flex;
    align-items: center;
    transition: transform 0.2s ease;
    background-color: $bg-general;
    border-radius: 100%;
    margin-left: 3px;
    width: 20px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__total {
    font-size: 0.9rem;
    font-weight: normal;
    font-family: $font-medium;
  }
}

.slide-enter-active,
.slide-leave-active {
  transition:
    max-height 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 5000px;
  overflow: hidden;
  will-change: max-height, opacity;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
