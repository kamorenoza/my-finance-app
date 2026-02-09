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

  const loadEntries = () => {
    entries.value = budgetService.loadEntries()
  }

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
      // Usar selectedDate (mes del selector) NO la fecha del presupuesto
      const month = dayjs(selectedDate.value).format('YYYY-MM')

      // Agregar modificación al entry
      if (!entry.modifications) {
        entry.modifications = []
      }

      // Remover modificaciones anteriores para este mes si es 'this'
      if (appliedTo === 'this') {
        entry.modifications = entry.modifications.filter(m => m.month !== month)

        // Crear la modificación para este mes
        const modification: BudgetModification = {
          month,
          appliedTo
        }
        if (updated.name !== entry.name) {
          modification.name = updated.name
        }
        if (updated.value !== entry.value) {
          modification.value = updated.value
        }
        entry.modifications.push(modification)
      } else if (appliedTo === 'all') {
        // Si es 'all', limpiar todas las modificaciones y actualizar el entry principal
        entry.modifications = []
        entry.name = updated.name
        entry.value = updated.value
      } else if (appliedTo === 'future') {
        // Si es 'future', crear modificaciones para meses pasados con el valor original
        // y actualizar el valor base para los futuros
        const selectedMonth = dayjs(month)
        const entryMonth = dayjs(entry.date).startOf('month')
        const oldValue = entry.value
        const oldName = entry.name

        const newModifications: BudgetModification[] = []

        // Para todos los meses desde entry.date hasta el anterior al seleccionado
        let current = entryMonth
        while (current.isBefore(selectedMonth)) {
          const monthStr = current.format('YYYY-MM')
          const existingMod = entry.modifications?.find(
            m => m.month === monthStr
          )

          if (existingMod) {
            // Mantener la modificación existente
            newModifications.push(existingMod)
          } else {
            // Crear nueva modificación con el valor original
            newModifications.push({
              month: monthStr,
              value: oldValue,
              ...(oldName !== updated.name && { name: oldName }),
              appliedTo: 'future'
            })
          }
          current = current.add(1, 'month')
        }

        entry.modifications = newModifications
        entry.name = updated.name
        entry.value = updated.value
      }

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
    loadEntries,
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
