<template>
  <div>
    <!-- Sin agrupar -->
    <BudgetItem
      v-for="entry in entries"
      :key="entry.id"
      :entry="entry"
      :reference-date="referenceDate"
      @edit="$emit('edit', entry)"
    />

    <!-- Grupo de Gastos del mes (sin agrupar) -->
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

interface Props {
  entries: BudgetEntry[]
  referenceDate: Date
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

defineProps<Props>()
defineEmits<Emits>()
</script>
