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
}
