export type EntryType = 'ingreso' | 'gasto'

export interface BudgetModification {
  month: string // formato: YYYY-MM
  name?: string
  value?: number
  appliedTo: 'this' | 'all' | 'future'
}

export interface BudgetEntry {
  id: string
  name: string
  value: number
  date: string
  category: string | null
  type: EntryType
  isFixed: boolean
  isPaid: boolean
  repeat?: number
  comments?: string
  modifications?: BudgetModification[]
}
