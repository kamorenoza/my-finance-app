<template>
  <div>
    <!-- Agrupado con collapse -->
    <template v-for="group in groups" :key="group.label">
      <p
        class="budget-group__header"
        @click="$emit('toggleGroup', group.label)"
      >
        <span class="budget-group__header-content">
          <span>{{ formatGroupName(group.label) }}</span>
          <span class="budget-group__chevron">
            <v-icon size="17">
              {{
                expandedGroups[group.label] === false
                  ? 'mdi-chevron-down'
                  : 'mdi-chevron-up'
              }}
            </v-icon>
          </span>
        </span>
        <span class="budget-group__total">{{
          currency(Math.abs(group.total))
        }}</span>
      </p>
      <transition name="slide">
        <div v-show="expandedGroups[group.label] !== false">
          <BudgetItem
            v-for="entry in group.entries"
            :key="entry.id"
            :entry="entry"
            :reference-date="referenceDate"
            @edit="$emit('edit', entry)"
          />
        </div>
      </transition>
    </template>

    <!-- Grupo de Gastos del mes -->
    <BudgetMonthExpenses
      :expenses="monthExpenses"
      :total="totalMonthExpenses"
      :add-expenses-to-budget="addExpensesToBudget"
      :is-expanded="expandedGroups['gastos-del-mes']"
      @toggle-group="$emit('toggleGroup', $event)"
      @update:add-expenses-to-budget="
        $emit('update:addExpensesToBudget', $event)
      "
    />
  </div>
</template>

<script setup lang="ts">
import type { BudgetEntry } from '../budget.interface'
import type { Expense } from '@/modules/expenses/expenses.interface'
import BudgetItem from './BudgetItem.vue'
import BudgetMonthExpenses from './BudgetMonthExpenses.vue'
import { dateFormatter } from '@/modules/shared/utils'

interface BudgetGroup {
  label: string
  total: number
  entries: BudgetEntry[]
}

interface Props {
  groups: BudgetGroup[]
  referenceDate: Date
  groupBy: string | null
  monthExpenses: Expense[]
  totalMonthExpenses: number
  addExpensesToBudget: boolean
  expandedGroups: Record<string, boolean>
}

interface Emits {
  (e: 'edit', entry: BudgetEntry): void
  (e: 'toggleGroup', groupName: string): void
  (e: 'update:addExpensesToBudget', value: boolean): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const formatGroupName = (groupName: string) => {
  if (props.groupBy === 'date') {
    // groupName está en formato 'DD/MM/YYYY', convertir a Date y formatear
    const [day, month, year] = groupName.split('/')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return dateFormatter(date)
  }
  return groupName
}

const currency = (value: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value)
</script>

<style scoped lang="scss">
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
