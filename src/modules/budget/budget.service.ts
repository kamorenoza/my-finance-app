import type { BudgetEntry, BudgetCategory, GeneralIncome } from './budget.interface'
import { generateId } from '../shared/utils'

const getUserEmail = () => {
  const userString = localStorage.getItem('user')
  const user = userString ? JSON.parse(userString) : null
  return user ? user.email : null
}

export const budgetService = {
  loadEntries: (): BudgetEntry[] => {
    const userEmail = getUserEmail()
    if (!userEmail) return []
    const data = localStorage.getItem(`budget_${userEmail}`)
    const entries = data ? JSON.parse(data) : []

    // Ensure all entries have IDs (migrate legacy data)
    let modified = false
    const migratedEntries = entries.map((entry: BudgetEntry) => {
      if (!entry.id) {
        modified = true
        return { ...entry, id: generateId() }
      }
      return entry
    })

    // Save migrated data back if any entries were missing IDs
    if (modified) {
      localStorage.setItem(
        `budget_${userEmail}`,
        JSON.stringify(migratedEntries)
      )
    }

    return migratedEntries
  },

  addEntry: (entry: BudgetEntry) => {
    const userEmail = getUserEmail()
    if (!userEmail) return
    const entries = budgetService.loadEntries()
    entries.push(entry)
    localStorage.setItem(`budget_${userEmail}`, JSON.stringify(entries))
  },

  updateEntry: (updated: BudgetEntry) => {
    const userEmail = getUserEmail()
    if (!userEmail) return
    const entries = budgetService
      .loadEntries()
      .map(entry => (entry.id === updated.id ? updated : entry))
    localStorage.setItem(`budget_${userEmail}`, JSON.stringify(entries))
  },

  deleteEntry: (id: string) => {
    const userEmail = getUserEmail()
    if (!userEmail) return
    const entries = budgetService.loadEntries().filter(entry => entry.id !== id)
    localStorage.setItem(`budget_${userEmail}`, JSON.stringify(entries))
  },

  // Budget Categories
  loadBudgetCategories: (): BudgetCategory[] => {
    const userEmail = getUserEmail()
    if (!userEmail) return []
    const data = localStorage.getItem(`budget_categories_${userEmail}`)
    return data ? JSON.parse(data) : []
  },

  addBudgetCategory: (category: BudgetCategory) => {
    const userEmail = getUserEmail()
    if (!userEmail) return
    const categories = budgetService.loadBudgetCategories()
    categories.push(category)
    localStorage.setItem(`budget_categories_${userEmail}`, JSON.stringify(categories))
  },

  updateBudgetCategory: (updated: BudgetCategory) => {
    const userEmail = getUserEmail()
    if (!userEmail) return
    const categories = budgetService
      .loadBudgetCategories()
      .map(cat => (cat.id === updated.id ? updated : cat))
    localStorage.setItem(`budget_categories_${userEmail}`, JSON.stringify(categories))
  },

  deleteBudgetCategory: (id: string) => {
    const userEmail = getUserEmail()
    if (!userEmail) return
    const categories = budgetService.loadBudgetCategories().filter(cat => cat.id !== id)
    localStorage.setItem(`budget_categories_${userEmail}`, JSON.stringify(categories))
  },

  // General Income
  loadGeneralIncome: (): GeneralIncome[] => {
    const userEmail = getUserEmail()
    if (!userEmail) return []
    const data = localStorage.getItem(`general_income_${userEmail}`)
    return data ? JSON.parse(data) : []
  },

  addGeneralIncome: (income: GeneralIncome) => {
    const userEmail = getUserEmail()
    if (!userEmail) return
    const incomes = budgetService.loadGeneralIncome()
    incomes.push(income)
    localStorage.setItem(`general_income_${userEmail}`, JSON.stringify(incomes))
  },

  updateGeneralIncome: (updated: GeneralIncome) => {
    const userEmail = getUserEmail()
    if (!userEmail) return
    const incomes = budgetService
      .loadGeneralIncome()
      .map(inc => (inc.id === updated.id ? updated : inc))
    localStorage.setItem(`general_income_${userEmail}`, JSON.stringify(incomes))
  },

  deleteGeneralIncome: (id: string) => {
    const userEmail = getUserEmail()
    if (!userEmail) return
    const incomes = budgetService.loadGeneralIncome().filter(inc => inc.id !== id)
    localStorage.setItem(`general_income_${userEmail}`, JSON.stringify(incomes))
  }
}