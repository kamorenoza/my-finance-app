// src/modules/auth/store/authStore.ts
import type { User } from 'firebase/auth'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    loading: true
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
