import { defineStore } from 'pinia'
import { accountService } from './accounts.service'
import type { Account, Expense } from './accounts.interface'
import { generateId } from '@/modules/shared/utils'
import { AccountView } from './accounts.constants'
import { backupService } from '@/modules/shared/services/backup.service'
import { useExpensesStore } from '@/modules/expenses/expenses.store'

export const useAccountsStore = defineStore('accounts', {
  state: () => ({
    viewMode: accountService.getViewConfiguration(),
    accounts: accountService.loadAccounts(),
    search: '',
    selectedType: 'all' as 'all' | Account['type'],
    sortBy: 'name' as 'name' | 'type',
    currentIndexAccount: 0,
    selectedExpense: null as Expense | null
  }),

  getters: {
    filteredAccounts(state): Account[] {
      let result = [...state.accounts]

      if (state.selectedType !== 'all') {
        result = result.filter(account => account.type === state.selectedType)
      }

      if (state.search.trim()) {
        const keyword = state.search.toLowerCase()
        result = result.filter(account =>
          account.name.toLowerCase().includes(keyword)
        )
      }

      result.sort((a, b) => {
        const aKey = a[state.sortBy].toLowerCase()
        const bKey = b[state.sortBy].toLowerCase()
        return aKey.localeCompare(bKey)
      })

      return result
    },

    getCurrentAccount(state) {
      return state.accounts[state.currentIndexAccount]
    },

    getAccountById: state => (id: string) => {
      return state.accounts.find(account => account.id === id)
    }
  },

  actions: {
    setView(view: AccountView) {
      this.viewMode = view
      accountService.saveViewConfiguration(view)
    },

    setCurrentIndexAccount(index: number) {
      this.currentIndexAccount = index
    },

    setSelectedExpense(expense: Expense | null) {
      this.selectedExpense = expense
    },

    loadAccounts() {
      const oldIndex = this.currentIndexAccount
      this.accounts = accountService.loadAccounts()
      this.currentIndexAccount = Math.min(oldIndex, this.accounts.length - 1)
    },

    addAccount(account: Omit<Account, 'id'>) {
      const exists = this.accounts.some(
        (a: Account) =>
          a.name.trim().toLowerCase() === account.name.trim().toLowerCase()
      )
      if (exists) {
        throw new Error('La cuenta ya existe')
      }
      const newAccount = {
        ...account,
        id: generateId()
      }
      accountService.addAccount(newAccount)
      this.loadAccounts()
      backupService.queueBackup()
    },

    deleteAccount(account: Account) {
      accountService.deleteAccount(account)
      useExpensesStore().onAccountDelete(account.id!)
      this.loadAccounts()
      backupService.queueBackup()
    },

    updateAccount(account: Account) {
      const exists = this.accounts.some(
        (a: Account) =>
          a.name.trim().toLowerCase() === account.name.trim().toLowerCase() &&
          a.id !== account.id
      )
      if (exists) {
        throw new Error('La cuenta ya existe')
      }
      const oldAccount = this.accounts.find(a => a.id === account.id)
      accountService.updateAccount(account)
      if (oldAccount && oldAccount.name !== account.name) {
        useExpensesStore().onAccountUpdate(account.id!, account.name)
      }
      this.loadAccounts()
      backupService.queueBackup()
    },

    addExpense(expense: Expense, accountId?: string, existingId?: string) {
      if (!accountId) {
        throw new Error('Error al crear el movimiento')
      }

      const newExpense: Expense = {
        ...expense,
        id: existingId || generateId()
      }
      const currentIndex = this.currentIndexAccount
      accountService.addExpenseToAccount(accountId, newExpense)
      this.loadAccounts()
      this.setCurrentIndexAccount(currentIndex)
      backupService.queueBackup()
    },

    updateExpense(accountId: string, updatedExpense: Expense) {
      accountService.updateExpenseInAccount(accountId, updatedExpense)
      this.loadAccounts()
      backupService.queueBackup()
    },

    deleteExpense(accountId: string, expenseId: string) {
      accountService.deleteExpenseFromAccount(accountId, expenseId)
      this.loadAccounts()
      backupService.queueBackup()
    },

    clearFilters() {
      this.search = ''
      this.selectedType = 'all'
      this.sortBy = 'name'
    }
  }
})
