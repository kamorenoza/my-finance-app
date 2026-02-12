import type { Expense } from './expenses.interface'

const getUserEmail = () => {
  const userString = localStorage.getItem('user')
  const user = userString ? JSON.parse(userString) : null
  return user ? user.email : null
}

export const expensesService = {
  loadExpenses: (): Expense[] => {
    const userEmail = getUserEmail()
    if (!userEmail) return []
    const data = localStorage.getItem(`expenses_${userEmail}`)
    return data ? JSON.parse(data) : []
  },

  addExpense: (expense: Expense) => {
    const userEmail = getUserEmail()
    if (!userEmail) return
    const expenses = expensesService.loadExpenses()
    expenses.push(expense)
    localStorage.setItem(`expenses_${userEmail}`, JSON.stringify(expenses))
  },

  updateExpense: (updated: Expense) => {
    const userEmail = getUserEmail()
    if (!userEmail) return
    const expenses = expensesService
      .loadExpenses()
      .map((exp: Expense) => (exp.id === updated.id ? updated : exp))
    localStorage.setItem(`expenses_${userEmail}`, JSON.stringify(expenses))
  },

  deleteExpense: (expenseId: string) => {
    const userEmail = getUserEmail()
    if (!userEmail) return
    let expenses = expensesService.loadExpenses()
    expenses = expenses.filter((exp: Expense) => exp.id !== expenseId)
    localStorage.setItem(`expenses_${userEmail}`, JSON.stringify(expenses))
  }
}
