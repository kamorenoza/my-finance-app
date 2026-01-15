import { defineStore } from 'pinia'
import { accountService } from './accounts.service'
import type { Account, Expense } from './accounts.interface'
import { generateId } from '@/modules/shared/utils'
import { AccountView } from './accounts.constants'

export const useAccountsStore = defineStore('accounts', {
  state: () => ({
    viewMode: accountService.getViewConfiguration(),
    accounts: accountService.loadAccounts(),
    search: '',
    selectedType: 'all' as 'all' | Account['type'],
    sortBy: 'name' as 'name' | 'type',
    currentIndexAccount: 0
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

    loadAccounts() {
      this.accounts = accountService.loadAccounts()
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
    },

    deleteAccount(account: Account) {
      accountService.deleteAccount(account)
      this.loadAccounts()
    },

    updateAccount(account: Account) {
      accountService.updateAccount(account)
      this.loadAccounts()
    },

    addExpense(expense: Expense, accountId?: string) {
      if (!accountId) {
        throw new Error('Error al crear el movimiento')
      }

      const newExpense: Expense = {
        ...expense,
        id: generateId()
      }
      accountService.addExpenseToAccount(accountId, newExpense)
      this.loadAccounts()
    },

    updateExpense(accountId: string, updatedExpense: Expense) {
      accountService.updateExpenseInAccount(accountId, updatedExpense)
      this.loadAccounts()
    },

    deleteExpense(accountId: string, expenseId: string) {
      accountService.deleteExpenseFromAccount(accountId, expenseId)
      this.loadAccounts()
    },

    clearFilters() {
      this.search = ''
      this.selectedType = 'all'
      this.sortBy = 'name'
    }
  }
})
