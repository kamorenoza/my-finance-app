import type { EntryType } from '../budget/budget.interface'
import type { AccountTypes } from './accounts.constants'

export interface Account {
  id?: string
  name: string
  type: AccountTypes
  expenses?: Expense[]
  creditLimit?: number
  cutoffDate?: number
  dueDate?: number
}

export interface Expense {
  id?: string
  description: string
  value: number
  type: EntryType
  isPending: boolean
  comments?: string
  date: string | Date
  category: any
}
