export type EntryType = 'ingreso' | 'gasto'

export interface BudgetEntry {
  id: string
  name: string
  value: number
  date: string
  category: string
  type: EntryType
  isFixed: boolean
  isPaid: boolean
  repeat?: number
}
