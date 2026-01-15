import { defineStore } from 'pinia'
import { categoryService } from './categories.service'
import type { Category } from './categories.interface'
import { generateId } from '@/modules/shared/utils'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: categoryService.loadCategories()
  }),

  actions: {
    loadCategories() {
      this.categories = categoryService.loadCategories()
    },

    addCategory(category: Category) {
      const exists = this.categories.some(
        (c: Category) =>
          c.name.trim().toLowerCase() === category.name.trim().toLowerCase()
      )
      if (exists) {
        throw new Error('La categoría ya existe')
      }

      const newCategory = {
        ...category,
        id: generateId()
      }
      categoryService.addCategory(newCategory)
      this.loadCategories()
    },

    deleteCategory(category: Category) {
      categoryService.deleteCategory(category)
      this.loadCategories()
    },

    updateCategory(category: Category) {
      categoryService.updateCategory(category)
      this.loadCategories()
    }
  }
})
