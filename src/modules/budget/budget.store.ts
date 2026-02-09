import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import type { BudgetEntry, BudgetModification } from './budget.interface'
import { budgetService } from './budget.service'
import { backupService } from '../shared/services/backup.service'

export const useBudgetStore = defineStore('budget', () => {
  const entries = ref<BudgetEntry[]>(budgetService.loadEntries())
  const selectedDate = ref(dayjs().startOf('month').toDate())
  const selectedEntry = ref<BudgetEntry | null>(null)

  const addEntry = (entry: BudgetEntry) => {
    budgetService.addEntry(entry)
    entries.value.push(entry)
    backupService.queueBackup()
  }

  const updateEntry = (updated: BudgetEntry) => {
    const index = entries.value.findIndex(e => e.id === updated.id)
    if (index !== -1) {
      entries.value[index] = updated
      budgetService.updateEntry(updated)
      backupService.queueBackup()
    }
  }

  const updateEntryWithModification = (
    updated: BudgetEntry,
    appliedTo: 'this' | 'all' | 'future'
  ) => {
    const index = entries.value.findIndex(e => e.id === updated.id)
    if (index !== -1) {
      const entry = entries.value[index]
      const month = dayjs(updated.date).format('YYYY-MM')

      // Crear la modificación
      const modification: BudgetModification = {
        month,
        appliedTo
      }

      // Agregar nombre si cambió
      if (updated.name !== entry.name) {
        modification.name = updated.name
      }

      // Agregar valor si cambió
      if (updated.value !== entry.value) {
        modification.value = updated.value
      }

      // Agregar modificación al entry
      if (!entry.modifications) {
        entry.modifications = []
      }

      // Remover modificaciones anteriores para este mes si es 'this'
      if (appliedTo === 'this') {
        entry.modifications = entry.modifications.filter(m => m.month !== month)
      } else if (appliedTo === 'all') {
        // Si es 'all', limpiar todas las modificaciones y actualizar el entry principal
        entry.modifications = []
        entry.name = updated.name
        entry.value = updated.value
      } else if (appliedTo === 'future') {
        // Si es 'future', remover modificaciones de este mes en adelante
        entry.modifications = entry.modifications.filter(m =>
          dayjs(m.month).isBefore(dayjs(month))
        )
      }

      entry.modifications.push(modification)
      budgetService.updateEntry(entry)
      backupService.queueBackup()
    }
  }

  const deleteEntry = (id: string) => {
    entries.value = entries.value.filter(e => e.id !== id)
    budgetService.deleteEntry(id)
    backupService.queueBackup()
  }

  const setSelectedEntry = (entry: BudgetEntry | null) => {
    selectedEntry.value = entry
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
      .filter(e => e.type === 'ingreso')
      .reduce((sum, e) => sum + e.value, 0)
  })

  const totalExpensesBudget = computed(() => {
    return filteredEntries.value
      .filter(e => e.type === 'gasto')
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
    selectedEntry,
    addEntry,
    updateEntry,
    updateEntryWithModification,
    deleteEntry,
    setSelectedEntry,
    filteredEntries,
    totalIncomes,
    totalExpenses,
    totalIncomesBudget,
    totalExpensesBudget,
    totalIncomesReal,
    totalExpensesReal
  }
})
