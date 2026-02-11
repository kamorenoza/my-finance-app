import { AccountView } from './accounts.constants'
import type { Account, Expense } from './accounts.interface'

const getUserEmail = () => {
  const userString = localStorage.getItem('user')
  const user = userString ? JSON.parse(userString) : null
  return user ? user.email : null
}

export const accountService = {
  loadAccounts: (): Account[] => {
    const userEmail = getUserEmail()
    if (!userEmail) return []
    const accounts = localStorage.getItem(`accounts_${userEmail}`)
    return accounts ? JSON.parse(accounts) : []
  },

  addAccount: (account: Account) => {
    const userEmail = getUserEmail()
    if (!userEmail) return
    const accounts = accountService.loadAccounts()
    accounts.push(account)
    localStorage.setItem(`accounts_${userEmail}`, JSON.stringify(accounts))
  },

  updateAccount: (updated: Account) => {
    const userEmail = getUserEmail()
    if (!userEmail) return
    const accounts = accountService
      .loadAccounts()
      .map((acc: Account) => (acc.id === updated.id ? updated : acc))
    localStorage.setItem(`accounts_${userEmail}`, JSON.stringify(accounts))
  },

  deleteAccount: (account: Account) => {
    const userEmail = getUserEmail()
    if (!userEmail) return
    let accounts = accountService.loadAccounts()
    accounts = accounts.filter((acc: Account) => acc.id !== account.id)
    localStorage.setItem(`accounts_${userEmail}`, JSON.stringify(accounts))
  },

  saveViewConfiguration: (view: AccountView) => {
    const userEmail = getUserEmail()
    if (!userEmail) return
    localStorage.setItem(
      `viewAccountConfiguration_${userEmail}`,
      JSON.stringify(view)
    )
  },

  getViewConfiguration: (): AccountView => {
    const defaultView = AccountView.carousel
    const userEmail = getUserEmail()
    if (!userEmail) return defaultView

    const key = `viewAccountConfiguration_${userEmail}`
    const data = localStorage.getItem(key)

    if (data) {
      try {
        return JSON.parse(data) as AccountView
      } catch {}
    }

    localStorage.setItem(key, JSON.stringify(defaultView))
    return defaultView
  },

  addExpenseToAccount: (accountId: string, newExpense: Expense) => {
    const userEmail = getUserEmail()
    if (!userEmail) return
    const accounts = accountService.loadAccounts()
    const updatedAccounts = accounts.map((acc: Account) => {
      if (acc.id === accountId) {
        const expenses = acc.expenses ?? []
        const newExpenses = [...expenses, newExpense]

        return {
          ...acc,
          expenses: newExpenses
        }
      }
      return acc
    })

    localStorage.setItem(
      `accounts_${userEmail}`,
      JSON.stringify(updatedAccounts)
    )
  },

  updateExpenseInAccount: (accountId: string, updatedExpense: Expense) => {
    const userEmail = getUserEmail()
    if (!userEmail) return
    const accounts = accountService.loadAccounts()
    const updatedAccounts = accounts.map((acc: Account) => {
      if (acc.id === accountId) {
        const expenses = (acc.expenses ?? []).map(e =>
          e.id === updatedExpense.id ? updatedExpense : e
        )
        return { ...acc, expenses }
      }
      return acc
    })
    localStorage.setItem(
      `accounts_${userEmail}`,
      JSON.stringify(updatedAccounts)
    )
  },

  deleteExpenseFromAccount: (accountId: string, expenseId: string) => {
    const userEmail = getUserEmail()
    if (!userEmail) return
    const accounts = accountService.loadAccounts()
    const updatedAccounts = accounts.map((acc: Account) => {
      if (acc.id === accountId) {
        const expenses = (acc.expenses ?? []).filter(e => e.id !== expenseId)
        return { ...acc, expenses }
      }
      return acc
    })
    localStorage.setItem(
      `accounts_${userEmail}`,
      JSON.stringify(updatedAccounts)
    )
  }
}
