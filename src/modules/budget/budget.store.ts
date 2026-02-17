import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import type { BudgetEntry, BudgetModification } from './budget.interface'
import { budgetService } from './budget.service'
import { backupService } from '../shared/services/backup.service'
import { useExpensesStore } from '@/modules/expenses/expenses.store'
import { configService } from '@/modules/shared/services/config.service'

export const useBudgetStore = defineStore('budget', () => {
  const entries = ref<BudgetEntry[]>(budgetService.loadEntries())
  const selectedDate = ref(dayjs().startOf('month').toDate())
  const selectedEntry = ref<BudgetEntry | null>(null)
  const addExpensesToBudget = ref(false)

  // Cargar estado del toggle al inicializar
  const loadConfig = () => {
    const savedConfig = configService.getBudgetConfig()
    if (savedConfig.addExpensesToBudget !== undefined) {
      addExpensesToBudget.value = savedConfig.addExpensesToBudget
    }
  }
  loadConfig()

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

  const updateEntryIsPaidForMonth = (entryId: string, isPaid: boolean) => {
    const index = entries.value.findIndex(e => e.id === entryId)
    if (index !== -1) {
      const entry = entries.value[index]
      const month = dayjs(selectedDate.value).format('YYYY-MM')

      if (!entry.modifications) {
        entry.modifications = []
      }

      // Buscar si ya existe una modificación para este mes
      const existingModIndex = entry.modifications.findIndex(
        m => m.month === month
      )

      if (existingModIndex !== -1) {
        // Actualizar la modificación existente
        entry.modifications[existingModIndex].isPaid = isPaid
      } else {
        // Crear nueva modificación
        entry.modifications.push({
          month,
          isPaid,
          appliedTo: 'this'
        })
      }

      budgetService.updateEntry(entry)
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
        // Buscar si ya existe una modificación para este mes (con isPaid de updateEntryIsPaidForMonth)
        let modification = entry.modifications?.find(m => m.month === month)

        if (!modification) {
          // No existe, crear nueva
          modification = {
            month,
            appliedTo: 'this'
          }
          entry.modifications!.push(modification)
        }

        // Actualizar solo name y value, preservando isPaid si existe
        if (updated.name !== entry.name) {
          modification.name = updated.name
        }
        if (updated.value !== entry.value) {
          modification.value = updated.value
        }
      } else if (appliedTo === 'all') {
        // Si es 'all', limpiar todas las modificaciones y actualizar el entry principal
        // Pero isPaid SOLO cambia para el mes actual (ya fue manejado por updateEntryIsPaidForMonth)
        // Preservar la modificación del mes actual (con isPaid)
        const currentMonthMod = entry.modifications?.find(
          m => m.month === month
        )
        entry.modifications = []
        if (currentMonthMod) {
          entry.modifications.push(currentMonthMod)
        }
        entry.name = updated.name
        entry.value = updated.value
        // NO cambiar entry.isPaid aquí - isPaid SIEMPRE cambia solo para el mes actual
      } else if (appliedTo === 'future') {
        // Si es 'future', crear modificaciones para meses pasados con el valor original
        // y actualizar el valor base para los futuros
        // isPaid ya fue manejado por updateEntryIsPaidForMonth solo para el mes actual
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
            const futureModification: BudgetModification = {
              month: monthStr,
              value: oldValue,
              appliedTo: 'future'
            }
            if (oldName !== updated.name) {
              futureModification.name = oldName
            }
            newModifications.push(futureModification)
          }
          current = current.add(1, 'month')
        }

        // Preservar la modificación del mes actual (isPaid fue guardado por updateEntryIsPaidForMonth)
        const currentMonthMod = entry.modifications?.find(
          m => m.month === month
        )
        if (currentMonthMod) {
          newModifications.push(currentMonthMod)
        }

        entry.modifications = newModifications
        entry.name = updated.name
        entry.value = updated.value
        // NO cambiar entry.isPaid aquí - ya fue manejado por updateEntryIsPaidForMonth para el mes actual
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

  // Helper para obtener el isPaid considerando modificaciones mensuales
  const getDisplayIsPaid = (entry: BudgetEntry, dateRef: Date): boolean => {
    const month = dayjs(dateRef).format('YYYY-MM')
    const modification = entry.modifications?.find(m => m.month === month)
    return modification && modification.isPaid !== undefined
      ? modification.isPaid
      : entry.isPaid
  }

  // Helper para obtener el value considerando modificaciones mensuales
  const getDisplayValue = (entry: BudgetEntry, dateRef: Date): number => {
    const month = dayjs(dateRef).format('YYYY-MM')
    const modification = entry.modifications?.find(m => m.month === month)
    return modification && modification.value !== undefined
      ? modification.value
      : entry.value
  }

  const filteredEntries = computed(() => {
    const selectedMonth = dayjs(selectedDate.value)
    return entries.value.filter(e => {
      const entryMonth = dayjs(e.date)

      // Si es fijo, incluir si la fecha es <= al mes seleccionado
      if (e.isFixed) {
        return entryMonth.isSameOrBefore(selectedMonth, 'month')
      }

      // Si tiene repeat, incluir si está dentro del rango de repetición
      if (e.repeat && e.repeat > 0) {
        const endMonth = entryMonth.add(e.repeat - 1, 'month')
        return (
          selectedMonth.isSameOrAfter(entryMonth, 'month') &&
          selectedMonth.isSameOrBefore(endMonth, 'month')
        )
      }

      // De lo contrario, solo incluir si el mes coincide exactamente
      return entryMonth.isSame(selectedMonth, 'month')
    })
  })

  const totalIncomes = computed(() => {
    return filteredEntries.value
      .filter(e => e.type === 'ingreso')
      .reduce((sum, e) => sum + getDisplayValue(e, selectedDate.value), 0)
  })

  const totalExpenses = computed(() => {
    return filteredEntries.value
      .filter(e => e.type === 'gasto')
      .reduce((sum, e) => sum + getDisplayValue(e, selectedDate.value), 0)
  })

  const totalIncomesBudget = computed(() => {
    return filteredEntries.value
      .filter(e => e.type === 'ingreso')
      .reduce((sum, e) => sum + getDisplayValue(e, selectedDate.value), 0)
  })

  const totalExpensesBudget = computed(() => {
    let total = filteredEntries.value
      .filter(e => e.type === 'gasto')
      .reduce((sum, e) => sum + getDisplayValue(e, selectedDate.value), 0)

    // Agregar gastos del mes si el toggle está activado
    if (addExpensesToBudget.value) {
      const expensesStore = useExpensesStore()
      const month = dayjs(selectedDate.value).startOf('month')
      const monthEnd = dayjs(selectedDate.value).endOf('month')

      const monthExpensesTotal = expensesStore.expenses
        .filter(expense => {
          const expenseDate = dayjs(expense.date)
          return (
            (expenseDate.isAfter(month) && expenseDate.isBefore(monthEnd)) ||
            expenseDate.isSame(month, 'day') ||
            expenseDate.isSame(monthEnd, 'day')
          )
        })
        .reduce((sum, expense) => sum + expense.value, 0)

      total += monthExpensesTotal
    }

    return total
  })

  const totalIncomesReal = computed(() => {
    return filteredEntries.value
      .filter(
        e => e.type === 'ingreso' && getDisplayIsPaid(e, selectedDate.value)
      )
      .reduce((sum, e) => sum + getDisplayValue(e, selectedDate.value), 0)
  })

  const totalExpensesReal = computed(() => {
    let total = filteredEntries.value
      .filter(
        e => e.type === 'gasto' && getDisplayIsPaid(e, selectedDate.value)
      )
      .reduce((sum, e) => sum + getDisplayValue(e, selectedDate.value), 0)

    // Agregar gastos del mes si el toggle está activado (todos los expenses se consideran "reales")
    if (addExpensesToBudget.value) {
      const expensesStore = useExpensesStore()
      const month = dayjs(selectedDate.value).startOf('month')
      const monthEnd = dayjs(selectedDate.value).endOf('month')

      const monthExpensesTotal = expensesStore.expenses
        .filter(expense => {
          const expenseDate = dayjs(expense.date)
          return (
            (expenseDate.isAfter(month) && expenseDate.isBefore(monthEnd)) ||
            expenseDate.isSame(month, 'day') ||
            expenseDate.isSame(monthEnd, 'day')
          )
        })
        .reduce((sum, expense) => sum + expense.value, 0)

      total += monthExpensesTotal
    }

    return total
  })

  return {
    entries,
    selectedDate,
    selectedEntry,
    addExpensesToBudget,
    loadEntries,
    addEntry,
    updateEntry,
    updateEntryWithModification,
    updateEntryIsPaidForMonth,
    deleteEntry,
    setSelectedEntry,
    getDisplayValue,
    getDisplayIsPaid,
    filteredEntries,
    totalIncomes,
    totalExpenses,
    totalIncomesBudget,
    totalExpensesBudget,
    totalIncomesReal,
    totalExpensesReal
  }
})
