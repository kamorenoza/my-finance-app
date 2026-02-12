import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Expense, AccountReference } from './expenses.interface'
import { expensesService } from './expenses.service'
import { generateId } from '@/modules/shared/utils'
import { backupService } from '@/modules/shared/services/backup.service'
import { configService } from '@/modules/shared/services/config.service'

export const useExpensesStore = defineStore('expenses', () => {
  const expenses = ref<Expense[]>(expensesService.loadExpenses())
  const filterConfig = ref(configService.getExpensesConfig())

  const loadExpenses = () => {
    expenses.value = expensesService.loadExpenses()
  }

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: generateId(),
      date: expense.date || new Date()
    }
    expensesService.addExpense(newExpense)
    expenses.value.push(newExpense)
    backupService.queueBackup()
  }

  const updateExpense = (updated: Expense) => {
    const index = expenses.value.findIndex(e => e.id === updated.id)
    if (index !== -1) {
      expenses.value[index] = updated
      expensesService.updateExpense(updated)
      backupService.queueBackup()
    }
  }

  const deleteExpense = (expenseId: string) => {
    const index = expenses.value.findIndex(e => e.id === expenseId)
    if (index !== -1) {
      expenses.value.splice(index, 1)
      expensesService.deleteExpense(expenseId)
      backupService.queueBackup()
    }
  }

  const updateExpenseAccount = (
    expenseId: string,
    account: AccountReference | null
  ) => {
    const expense = expenses.value.find(e => e.id === expenseId)
    if (expense) {
      expense.account = account
      expensesService.updateExpense(expense)
      backupService.queueBackup()
    }
  }

  const onAccountUpdate = (accountId: string, newName: string) => {
    expenses.value.forEach(expense => {
      if (expense.account?.id === accountId) {
        expense.account.name = newName
        expensesService.updateExpense(expense)
      }
    })
    backupService.queueBackup()
  }

  const onAccountDelete = (accountId: string) => {
    expenses.value.forEach(expense => {
      if (expense.account?.id === accountId) {
        expense.account = null
        expensesService.updateExpense(expense)
      }
    })
    backupService.queueBackup()
  }

  const setFilterConfiguration = (
    groupBy: string | null,
    orderBy: string | null
  ) => {
    filterConfig.value = { groupBy, orderBy }
    configService.saveExpensesConfig({ groupBy, orderBy })
    backupService.queueBackup()
  }

  return {
    expenses,
    filterConfig,
    loadExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    updateExpenseAccount,
    onAccountUpdate,
    onAccountDelete,
    setFilterConfiguration
  }
})
