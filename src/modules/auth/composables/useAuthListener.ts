// src/modules/auth/composables/useAuthListener.ts
import { onAuthStateChanged, getAuth } from 'firebase/auth'
import { useAuthStore } from '@/modules/auth/auth.store'
import { firebaseApp } from '@/database/firebase'

const auth = getAuth(firebaseApp)

export const useAuthListener = () => {
  const authStore = useAuthStore()

  onAuthStateChanged(auth, user => {
    localStorage.setItem('user', JSON.stringify(user))
    authStore.setUser(user)
    authStore.setLoading(false)
  })
}
