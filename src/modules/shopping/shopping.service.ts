import type { ShoppingList, ShoppingItem } from './shopping.interface'

const STORAGE_KEY = 'shoppingLists'

/**
 * Get user email from localStorage
 */
const getUserEmail = (): string | null => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  try {
    const user = JSON.parse(userStr)
    return user?.email || null
  } catch {
    return null
  }
}

/**
 * Get user-scoped storage key
 */
const getUserKey = (baseKey: string): string => {
  const email = getUserEmail()
  return email ? `${baseKey}_${email}` : baseKey
}

/**
 * Load all shopping lists from localStorage
 */
export const loadShoppingLists = (): ShoppingList[] => {
  const email = getUserEmail()
  if (!email) return []

  const key = getUserKey(STORAGE_KEY)
  const data = localStorage.getItem(key)
  if (!data) return []

  try {
    return JSON.parse(data)
  } catch {
    return []
  }
}

/**
 * Save shopping lists to localStorage
 */
const saveShoppingLists = (lists: ShoppingList[]): void => {
  const email = getUserEmail()
  if (!email) return

  const key = getUserKey(STORAGE_KEY)
  localStorage.setItem(key, JSON.stringify(lists))
}

/**
 * Add a new shopping list
 */
export const addShoppingList = (list: ShoppingList): void => {
  const lists = loadShoppingLists()
  lists.push(list)
  saveShoppingLists(lists)
}

/**
 * Update an existing shopping list
 */
export const updateShoppingList = (updatedList: ShoppingList): void => {
  const lists = loadShoppingLists()
  const index = lists.findIndex(l => l.id === updatedList.id)
  if (index !== -1) {
    lists[index] = updatedList
    saveShoppingLists(lists)
  }
}

/**
 * Delete a shopping list
 */
export const deleteShoppingList = (id: string): void => {
  const lists = loadShoppingLists()
  const filtered = lists.filter(l => l.id !== id)
  saveShoppingLists(filtered)
}

/**
 * Get a shopping list by ID
 */
export const getShoppingListById = (id: string): ShoppingList | null => {
  const lists = loadShoppingLists()
  return lists.find(l => l.id === id) || null
}

/**
 * Add item to a shopping list
 */
export const addItemToList = (listId: string, item: ShoppingItem): void => {
  const lists = loadShoppingLists()
  const list = lists.find(l => l.id === listId)
  if (list) {
    list.items.push(item)
    saveShoppingLists(lists)
  }
}

/**
 * Update item in a shopping list
 */
export const updateItemInList = (
  listId: string,
  updatedItem: ShoppingItem
): void => {
  const lists = loadShoppingLists()
  const list = lists.find(l => l.id === listId)
  if (list) {
    const itemIndex = list.items.findIndex(i => i.id === updatedItem.id)
    if (itemIndex !== -1) {
      list.items[itemIndex] = updatedItem
      saveShoppingLists(lists)
    }
  }
}

/**
 * Delete item from a shopping list
 */
export const deleteItemFromList = (listId: string, itemId: string): void => {
  const lists = loadShoppingLists()
  const list = lists.find(l => l.id === listId)
  if (list) {
    list.items = list.items.filter(i => i.id !== itemId)
    saveShoppingLists(lists)
  }
}
