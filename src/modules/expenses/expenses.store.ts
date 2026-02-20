import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Expense, AccountReference } from './expenses.interface'
import { expensesService } from './expenses.service'
import { generateId } from '@/modules/shared/utils'
import { backupService } from '@/modules/shared/services/backup.service'
import { configService } from '@/modules/shared/services/config.service'
import { useAccountsStore } from '@/modules/accounts/accounts.store'

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

    // Sync to account if one is set
    if (newExpense.account?.id) {
      const accountsStore = useAccountsStore()
      const account = accountsStore.getAccountById(newExpense.account.id)
      if (account) {
        accountsStore.addExpense(
          {
            description: newExpense.name,
            value: newExpense.value,
            type: 'gasto',
            isPending: newExpense.isPending ?? false,
            date: newExpense.date || new Date(),
            category: null
          },
          newExpense.account.id,
          newExpense.id
        )
      }
    }

    backupService.queueBackup()
  }

  const updateExpense = (updated: Expense) => {
    const index = expenses.value.findIndex(e => e.id === updated.id)
    if (index !== -1) {
      const oldExpense = expenses.value[index]
      const oldAccountId = oldExpense.account?.id
      const newAccountId = updated.account?.id

      expenses.value[index] = updated
      expensesService.updateExpense(updated)

      const accountsStore = useAccountsStore()

      if (oldAccountId !== newAccountId) {
        // Account changed: remove from old, add to new
        if (oldAccountId) {
          accountsStore.deleteExpense(oldAccountId, updated.id)
        }
        if (newAccountId) {
          accountsStore.addExpense(
            {
              description: updated.name,
              value: updated.value,
              type: 'gasto',
              isPending: updated.isPending ?? false,
              date: updated.date || new Date(),
              category: null
            },
            newAccountId,
            updated.id
          )
        }
      } else if (newAccountId) {
        // Same account: update in place
        accountsStore.updateExpense(newAccountId, {
          id: updated.id,
          description: updated.name,
          value: updated.value,
          type: 'gasto',
          isPending: updated.isPending ?? false,
          date: updated.date || new Date(),
          category: null
        })
      }

      backupService.queueBackup()
    }
  }

  const deleteExpense = (expenseId: string) => {
    const index = expenses.value.findIndex(e => e.id === expenseId)
    if (index !== -1) {
      const expense = expenses.value[index]

      // Remove from account if linked
      if (expense.account?.id) {
        const accountsStore = useAccountsStore()
        accountsStore.deleteExpense(expense.account.id, expenseId)
      }

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
