// src/modules/auth/store/authStore.ts
import type { User } from 'firebase/auth'
import { defineStore } from 'pinia'

// Verificar si hay datos locales para inicializar loading correctamente
const hasLocalData = () => {
  const user = localStorage.getItem('user')
  if (!user) return false

  try {
    const email = JSON.parse(user).email
    if (!email) return false

    const accounts = localStorage.getItem(`accounts_${email}`)
    const budget = localStorage.getItem(`budget_${email}`)
    const categories = localStorage.getItem(`categories_${email}`)

    return !!(accounts || budget || categories)
  } catch {
    return false
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    // Solo mostrar loading si NO hay datos locales
    loading: !hasLocalData()
  }),
  actions: {
    setUser(user: User | null) {
      this.user = user
    },
    setLoading(state: boolean) {
      this.loading = state
    },
    logout() {
      this.user = null
    }
  }
})
