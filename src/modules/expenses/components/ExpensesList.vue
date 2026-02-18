<template>
  <div class="expenses__list">
    <ExpensesFilter @filterChange="handleFilterChange">
      <template #actions>
        <slot name="addButton" />
      </template>
    </ExpensesFilter>
    <EmptyState v-if="expenses.length === 0" />
    <div v-else class="expenses__list-content">
      <div
        v-for="(groupExpenses, groupName) in groupedExpenses"
        :key="groupName"
        class="expense-group"
      >
        <p
          v-if="groupBy !== 'none' && groupBy"
          class="expense-group__title"
          @click="toggleGroup(groupName)"
        >
          <span class="expense-group__title-content">
            <span>{{ formatGroupName(groupName) }}</span>
            <span class="expense-group__chevron">
              <v-icon size="17">
                {{
                  expandedGroups[groupName] === false
                    ? 'mdi-chevron-down'
                    : 'mdi-chevron-up'
                }}
              </v-icon>
            </span>
          </span>
          <span class="expense-group__total">{{
            currency(groupTotals[groupName] || 0)
          }}</span>
        </p>
        <transition name="slide">
          <div
            v-show="expandedGroups[groupName] !== false"
            class="expense-group__items"
          >
            <ExpenseItem
              v-for="expense in groupExpenses"
              :key="expense.id"
              :expense="expense"
              @edit="$emit('edit', expense)"
              @updateAccount="
                account => $emit('updateAccount', expense.id, account)
              "
            />
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Expense } from '../expenses.interface'
import ExpensesFilter from './ExpensesFilter.vue'
import ExpenseItem from './ExpenseItem.vue'
import EmptyState from '@/modules/shared/components/EmptyState.vue'
import { dateFormatter } from '@/modules/shared/utils'

interface Props {
  expenses: Expense[]
  groupedExpenses: Record<string, Expense[]>
  groupTotals: Record<string, number>
  groupBy: string | null
}

interface Emits {
  (e: 'edit', expense: Expense): void
  (e: 'updateAccount', expenseId: string, account: any): void
  (
    e: 'filterChange',
    filter: { search: string; groupBy: string | null; orderBy: string | null }
  ): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const expandedGroups = ref<Record<string, boolean>>({})

const formatGroupName = (groupName: string) => {
  if (props.groupBy === 'date') {
    // groupName está en formato 'DD/MM/YYYY', convertir a Date y formatear
    const [day, month, year] = groupName.split('/')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return dateFormatter(date)
  }
  return groupName
}

const toggleGroup = (groupName: string) => {
  expandedGroups.value[groupName] = !expandedGroups.value[groupName]
}

const handleFilterChange = (filter: {
  search: string
  groupBy: string | null
  orderBy: string | null
}) => {
  emit('filterChange', filter)
}

const currency = (value: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value)
</script>

<style lang="scss" scoped>
.expenses__list {
  flex: 1;

  &-content {
    height: calc(100vh - 450px);
    overflow-y: scroll;
    padding-bottom: 50px;
  }
}

.expense-group {
  margin-bottom: 20px;

  &__title {
    font-size: 0.95rem;
    font-family: $font-medium;
    padding: 10px 15px;
    margin: 0;
    margin-bottom: 5px;
    border-radius: 12px;
    color: #333;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.2s ease;

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
    font-weight: 600;
    font-size: 0.95rem;
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0 15px;
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
