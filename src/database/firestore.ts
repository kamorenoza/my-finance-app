// src/database/firestore.ts
import { getFirestore } from 'firebase/firestore'
import { firebaseApp } from './firebase'

export const db = getFirestore(firebaseApp)