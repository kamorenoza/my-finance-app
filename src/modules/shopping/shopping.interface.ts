export interface ShoppingItem {
  id: string
  name: string
  amount: number
  checked: boolean
  checkedAt?: string | null
  converted: boolean
  expenseId: string | null
}

export interface ShoppingList {
  id: string
  name: string
  createdDate: string
  converted: boolean
  expenseId: string | null
  items: ShoppingItem[]
}
