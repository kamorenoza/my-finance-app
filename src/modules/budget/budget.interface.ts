import type { Category } from '@/modules/categories/categories.interface'

export type EntryType = 'ingreso' | 'gasto'

export interface BudgetModification {
  month: string // formato: YYYY-MM
  name?: string
  value?: number
  isPaid?: boolean
  appliedTo: 'this' | 'all' | 'future'
}

export interface BudgetEntry {
  id: string
  name: string
  value: number
  date: string
  category: Category | null
  type: EntryType
  isFixed: boolean
  isPaid: boolean
  repeat?: number
  comments?: string
  modifications?: BudgetModification[]
  budgetCategoryId?: string | null // Para vincular con categoría de presupuesto
}

// Modificación mensual para categorías de presupuesto
export interface BudgetCategoryModification {
  month: string // formato: YYYY-MM
  name?: string
  budgetedAmount?: number
  appliedTo: 'this' | 'all' | 'future'
}

// Nueva interfaz para categorías de presupuesto
export interface BudgetCategory {
  id: string
  name: string
  budgetedAmount: number
  color?: string
  icon?: string
  order?: number
  modifications?: BudgetCategoryModification[]
}

// Ingreso general mensual
export interface GeneralIncome {
  id: string
  name: string
  value: number
  date: string
  isFixed: boolean
  repeat?: number
  modifications?: BudgetModification[]
}