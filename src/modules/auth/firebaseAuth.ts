import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { firebaseApp } from '@/database/firebase' // tu instancia de firebase
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'

const auth = getAuth(firebaseApp)
const provider = new GoogleAuthProvider()
const db = getFirestore(firebaseApp)

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    console.log('Usuario logueado:', user)

    // Verificar si el usuario ya existe en Firestore
    const userDocRef = doc(db, 'users', user.uid)
    const userDoc = await getDoc(userDocRef)

    // Si el usuario no existe, crearlo en Firestore
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date()
      })
      console.log('Usuario guardado en Firestore:', user)
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      console.log('El usuario ya existe en Firestore')
    }

    return user
  } catch (error) {
    console.error('Error al iniciar sesión:', error)
    throw error
  }
}
