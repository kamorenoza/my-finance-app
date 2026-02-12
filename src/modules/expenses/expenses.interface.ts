export interface AccountReference {
  id: string
  name: string
}

export interface Expense {
  id: string
  name: string
  value: number
  account: AccountReference | null
  date?: string | Date
}
