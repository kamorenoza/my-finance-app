import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User
} from 'firebase/auth'
import { auth, provider } from './firebase'

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    console.log('Usuario logueado:', user.displayName)
    return user
  } catch (error) {
    console.error('Error al iniciar sesión:', error)
    throw error
  }
}

export const logout = async () => {
  await signOut(auth)
}

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      getAuth(),
      user => {
        unsubscribe()
        resolve(user)
      },
      reject
    )
  })
}
