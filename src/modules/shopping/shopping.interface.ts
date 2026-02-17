export interface ShoppingItem {
  id: string
  name: string
  estimatedAmount: number
  realAmount: number
  checked: boolean
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
