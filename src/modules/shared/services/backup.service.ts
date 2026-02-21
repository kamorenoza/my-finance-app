import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where
} from 'firebase/firestore'
import { db } from '@/database/firestore'

// --- last_updated helpers -----------------------------------------------------

const getLocalLastUpdated = (email: string): string | null =>
  localStorage.getItem(`backup_last_updated_${email}`)

const setLocalLastUpdated = (email: string, timestamp: string) =>
  localStorage.setItem(`backup_last_updated_${email}`, timestamp)

// -----------------------------------------------------------------------------

const getLocalUserEmail = () => {
  const storedUser = localStorage.getItem('user')

  if (!storedUser) {
    return null
  }

  try {
    const parsedUser = JSON.parse(storedUser) as { email?: string }
    return parsedUser.email ?? null
  } catch (error) {
    console.error('Error parsing user from localStorage', error)
    return null
  }
}

const getBackupPayload = (email: string) => {
  const accounts = localStorage.getItem(`accounts_${email}`)
  const config = localStorage.getItem(`config_${email}`)
  const budget = localStorage.getItem(`budget_${email}`)
  const categories = localStorage.getItem(`categories_${email}`)
  const expenses = localStorage.getItem(`expenses_${email}`)
  const shoppingLists = localStorage.getItem(`shoppingLists_${email}`)

  return {
    accounts_email: accounts ? JSON.parse(accounts) : null,
    config_email: config ? JSON.parse(config) : null,
    budget_email: budget ? JSON.parse(budget) : null,
    categories: categories ? JSON.parse(categories) : null,
    expenses_email: expenses ? JSON.parse(expenses) : null,
    shoppingLists_email: shoppingLists ? JSON.parse(shoppingLists) : null
  }
}

const saveBackup = async (email: string) => {
  const now = new Date().toISOString()
  const payload = { ...getBackupPayload(email), last_updated: now }
  await setDoc(doc(db, 'backup', email), payload, { merge: true })
  setLocalLastUpdated(email, now)
}

const setLocalStorageFromBackup = (
  email: string,
  backupData: {
    accounts_email?: unknown
    config_email?: unknown
    budget_email?: unknown
    categories?: unknown
    expenses_email?: unknown
    shoppingLists_email?: unknown
  }
) => {
  if (backupData.accounts_email !== undefined) {
    localStorage.setItem(
      `accounts_${email}`,
      JSON.stringify(backupData.accounts_email)
    )
  }

  if (backupData.config_email !== undefined) {
    localStorage.setItem(
      `config_${email}`,
      JSON.stringify(backupData.config_email)
    )
  }

  if (backupData.budget_email !== undefined) {
    localStorage.setItem(
      `budget_${email}`,
      JSON.stringify(backupData.budget_email)
    )
  }

  if (backupData.categories !== undefined) {
    localStorage.setItem(
      `categories_${email}`,
      JSON.stringify(backupData.categories)
    )
  }

  if (backupData.expenses_email !== undefined) {
    localStorage.setItem(
      `expenses_${email}`,
      JSON.stringify(backupData.expenses_email)
    )
  }

  if (backupData.shoppingLists_email !== undefined) {
    localStorage.setItem(
      `shoppingLists_${email}`,
      JSON.stringify(backupData.shoppingLists_email)
    )
  }
}

// --- Weekly backup -----------------------------------------------------------

/** Document ID safe for Firestore: e.g. "2026-02-20T15-30-00-000Z" */
const toWeeklyDocId = (date: Date) => date.toISOString().replace(/[:.]/g, '-')

/** Parse the document ID back to a Date */
const fromWeeklyDocId = (id: string) =>
  new Date(id.replace(/T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/, 'T$1:$2:$3.$4Z'))

const checkAndRunWeeklyBackup = async (email: string) => {
  const colRef = collection(db, 'weekly_backup_email')
  const userQuery = query(
    colRef,
    where('email', '==', email),
    orderBy('created_at', 'desc'),
    limit(1)
  )
  const snapshot = await getDocs(userQuery)

  let shouldBackup = true

  if (!snapshot.empty) {
    const latestDoc = snapshot.docs[0]
    const latestDate = fromWeeklyDocId(latestDoc.id)
    const diffMs = Date.now() - latestDate.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    shouldBackup = diffDays >= 7
  }

  if (shouldBackup) {
    const now = new Date()
    const docId = toWeeklyDocId(now)
    const payload = getBackupPayload(email)
    await setDoc(doc(db, 'weekly_backup_email', docId), {
      ...payload,
      email,
      created_at: now.toISOString()
    })
  }
}

// -----------------------------------------------------------------------------

// Module-level debounce state shared between queueBackup and flushPendingBackup
let _queueTimeoutId: ReturnType<typeof setTimeout> | null = null
let _hasPendingBackup = false

export const backupService = {
  /**
   * Checks Firebase last_updated against localStorage last_updated.
   * If Firebase is newer (another device made changes), pulls all data from
   * Firebase into localStorage.
   * Returns true if localStorage was updated from Firebase, false otherwise.
   */
  checkAndSyncIfNeeded: async (
    email: string | null | undefined
  ): Promise<boolean> => {
    if (!email) return false

    try {
      const snapshot = await getDoc(doc(db, 'backup', email))

      if (!snapshot.exists()) return false

      const backupData = snapshot.data() as {
        last_updated?: string
        accounts_email?: unknown
        config_email?: unknown
        budget_email?: unknown
        categories?: unknown
        expenses_email?: unknown
        shoppingLists_email?: unknown
      }

      const firebaseLastUpdated = backupData.last_updated ?? null
      const localLastUpdated = getLocalLastUpdated(email)

      // Pull from Firebase if: no local timestamp, or Firebase is strictly newer
      if (
        !localLastUpdated ||
        (firebaseLastUpdated && firebaseLastUpdated > localLastUpdated)
      ) {
        setLocalStorageFromBackup(email, backupData)
        // Always persist a local timestamp so we don't keep re-pulling on every
        // open. If Firebase has no last_updated (old backup), use epoch so any
        // future real Firebase timestamp will still be considered newer.
        setLocalLastUpdated(
          email,
          firebaseLastUpdated ?? new Date(0).toISOString()
        )
        return true
      }

      return false
    } catch (error) {
      console.error('Error checking sync status', error)
      return false
    }
  },

  runBackupNow: async (email: string | null | undefined) => {
    if (!email) {
      return
    }

    await saveBackup(email)
  },

  queueBackup: (delayMs = 300) => {
    if (_queueTimeoutId) {
      clearTimeout(_queueTimeoutId)
    }

    _hasPendingBackup = true

    _queueTimeoutId = setTimeout(async () => {
      _hasPendingBackup = false
      _queueTimeoutId = null
      const email = getLocalUserEmail()

      if (!email) {
        return
      }

      try {
        await saveBackup(email)
      } catch (error) {
        console.error('Error running queued backup', error)
      }
    }, delayMs)
  },

  flushPendingBackup: async () => {
    if (!_hasPendingBackup) return

    if (_queueTimeoutId) {
      clearTimeout(_queueTimeoutId)
      _queueTimeoutId = null
    }

    _hasPendingBackup = false
    const email = getLocalUserEmail()
    if (!email) return

    try {
      await saveBackup(email)
    } catch (error) {
      console.error('Error flushing pending backup', error)
    }
  },

  checkAndRunWeeklyBackup: async (email: string | null | undefined) => {
    if (!email) return
    try {
      await checkAndRunWeeklyBackup(email)
    } catch (error) {
      console.error('Error running weekly backup', error)
    }
  }
}
