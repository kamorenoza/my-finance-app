import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { generateId } from '@/modules/shared/utils'
import type { BudgetEntry } from './budget.interface'
import { budgetService } from './budget.service'
import { backupService } from '../shared/services/backup.service'

export const useBudgetStore = defineStore('budget', () => {
  const entries = ref<BudgetEntry[]>(budgetService.loadEntries())
  const selectedDate = ref(dayjs().startOf('month').toDate())

  const addEntry = (entry: Omit<BudgetEntry, 'id'>) => {
    const newEntry = { ...entry, id: generateId() }
    budgetService.addEntry(newEntry)
    entries.value.push(newEntry)
    backupService.queueBackup()
  }

  const updateEntry = (id: string, updated: Partial<BudgetEntry>) => {
    const index = entries.value.findIndex(e => e.id === id)
    if (index !== -1) {
      entries.value[index] = { ...entries.value[index], ...updated }
      budgetService.updateEntry({ ...entries.value[index] })
      backupService.queueBackup()
    }
  }

  const deleteEntry = (id: string) => {
    entries.value = entries.value.filter(e => e.id !== id)
    budgetService.deleteEntry(id)
    backupService.queueBackup()
  }

  const filteredEntries = computed(() => {
    return entries.value.filter(e =>
      dayjs(e.date).isSame(dayjs(selectedDate.value), 'month')
    )
  })

  const totalIncomes = computed(() => {
    return filteredEntries.value
      .filter(e => e.type === 'ingreso')
      .reduce((sum, e) => sum + e.value, 0)
  })

  const totalExpenses = computed(() => {
    return filteredEntries.value
      .filter(e => e.type === 'gasto')
      .reduce((sum, e) => sum + e.value, 0)
  })

  const totalIncomesBudget = computed(() => {
    return filteredEntries.value
      .filter(e => e.type === 'ingreso' && !e.isPaid)
      .reduce((sum, e) => sum + e.value, 0)
  })

  const totalExpensesBudget = computed(() => {
    return filteredEntries.value
      .filter(e => e.type === 'gasto' && !e.isPaid)
      .reduce((sum, e) => sum + e.value, 0)
  })

  const totalIncomesReal = computed(() => {
    return filteredEntries.value
      .filter(e => e.type === 'ingreso' && e.isPaid)
      .reduce((sum, e) => sum + e.value, 0)
  })

  const totalExpensesReal = computed(() => {
    return filteredEntries.value
      .filter(e => e.type === 'gasto' && e.isPaid)
      .reduce((sum, e) => sum + e.value, 0)
  })

  return {
    entries,
    selectedDate,
    addEntry,
    updateEntry,
    deleteEntry,
    filteredEntries,
    totalIncomes,
    totalExpenses,
    totalIncomesBudget,
    totalExpensesBudget,
    totalIncomesReal,
    totalExpensesReal
  }
})
