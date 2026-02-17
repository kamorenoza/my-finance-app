import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ShoppingList, ShoppingItem } from './shopping.interface'
import * as shoppingService from './shopping.service'

export const useShoppingStore = defineStore('shopping', () => {
  // State
  const shoppingLists = ref<ShoppingList[]>([])
  const selectedListId = ref<string | null>(null)

  // Getters
  const unconvertedLists = computed(() => {
    return shoppingLists.value.filter(list => !list.converted)
  })

  const convertedLists = computed(() => {
    return shoppingLists.value.filter(list => list.converted)
  })

  const selectedList = computed(() => {
    if (!selectedListId.value) return null
    return shoppingLists.value.find(l => l.id === selectedListId.value) || null
  })

  // Actions
  const loadShoppingLists = () => {
    shoppingLists.value = shoppingService.loadShoppingLists()
  }

  const addShoppingList = (list: ShoppingList) => {
    shoppingService.addShoppingList(list)
    loadShoppingLists()
  }

  const updateShoppingList = (list: ShoppingList) => {
    shoppingService.updateShoppingList(list)
    loadShoppingLists()
  }

  const deleteShoppingList = (id: string) => {
    shoppingService.deleteShoppingList(id)
    loadShoppingLists()
  }

  const markListAsConverted = (id: string, expenseId: string) => {
    const list = shoppingLists.value.find(l => l.id === id)
    if (list) {
      list.converted = true
      list.expenseId = expenseId
      updateShoppingList(list)
    }
  }

  const setSelectedList = (id: string | null) => {
    selectedListId.value = id
  }

  // Item actions
  const addItemToList = (listId: string, item: ShoppingItem) => {
    shoppingService.addItemToList(listId, item)
    loadShoppingLists()
  }

  const updateItemInList = (listId: string, item: ShoppingItem) => {
    shoppingService.updateItemInList(listId, item)
    loadShoppingLists()
  }

  const deleteItemFromList = (listId: string, itemId: string) => {
    shoppingService.deleteItemFromList(listId, itemId)
    loadShoppingLists()
  }

  const toggleItemChecked = (listId: string, itemId: string) => {
    const list = shoppingLists.value.find(l => l.id === listId)
    if (list) {
      const item = list.items.find(i => i.id === itemId)
      if (item) {
        item.checked = !item.checked
        updateShoppingList(list)
      }
    }
  }

  // Initialize
  loadShoppingLists()

  return {
    // State
    shoppingLists,
    selectedListId,
    // Getters
    unconvertedLists,
    convertedLists,
    selectedList,
    // Actions
    loadShoppingLists,
    addShoppingList,
    updateShoppingList,
    deleteShoppingList,
    markListAsConverted,
    setSelectedList,
    addItemToList,
    updateItemInList,
    deleteItemFromList,
    toggleItemChecked
  }
})
