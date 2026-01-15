import type { Category } from './categories.interface'

const getUserEmail = () => {
  const userString = localStorage.getItem('user')
  const user = userString ? JSON.parse(userString) : null
  return user ? user.email : null
}

export const categoryService = {
  loadCategories: () => {
    const userEmail = getUserEmail()
    if (!userEmail) return []
    const categories = localStorage.getItem(`categories_${userEmail}`)
    return categories ? JSON.parse(categories) : []
  },

  addCategory: (category: Category) => {
    const userEmail = getUserEmail()
    if (!userEmail) return
    const categories = categoryService.loadCategories()
    categories.push(category)
    localStorage.setItem(`categories_${userEmail}`, JSON.stringify(categories))
  },

  updateCategory: (updated: Category) => {
    const userEmail = getUserEmail()
    if (!userEmail) return
    const categories = categoryService
      .loadCategories()
      .map((cat: Category) => (cat.id === updated.id ? updated : cat))
    localStorage.setItem(`categories_${userEmail}`, JSON.stringify(categories))
  },

  deleteCategory: (category: Category) => {
    const userEmail = getUserEmail()
    if (!userEmail) return
    let categories = categoryService.loadCategories()
    categories = categories.filter((cat: Category) => cat.id !== category.id)
    localStorage.setItem(`categories_${userEmail}`, JSON.stringify(categories))
  }
}
