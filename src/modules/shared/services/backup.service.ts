import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '@/database/firestore'

const getStoredBackupDate = (email: string) =>
  localStorage.getItem(`backup_${email}`)

const setStoredBackupDate = (email: string, dateValue: string) => {
  localStorage.setItem(`backup_${email}`, dateValue)
}

const shouldRunBackup = (email: string) => {
  const storedDate = getStoredBackupDate(email)
  const today = new Date().toISOString().split('T')[0]

  return !storedDate || storedDate < today
}

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

const getDeviceId = () => {
  const storedId = localStorage.getItem('backup_device_id')

  if (storedId) {
    return storedId
  }

  const newId = `device_${Math.random().toString(36).slice(2)}_${Date.now()}`
  localStorage.setItem('backup_device_id', newId)
  return newId
}

const getBackupPayload = (email: string) => {
  const deviceId = getDeviceId()
  const accounts = localStorage.getItem(`accounts_${email}`)
  const config = localStorage.getItem(`config_${email}`)
  const budget = localStorage.getItem(`budget_${email}`)
  const categories = localStorage.getItem(`categories_${email}`)
  const expenses = localStorage.getItem(`expenses_${email}`)

  return {
    device_id: deviceId,
    accounts_email: accounts ? JSON.parse(accounts) : null,
    config_email: config ? JSON.parse(config) : null,
    budget_email: budget ? JSON.parse(budget) : null,
    categories: categories ? JSON.parse(categories) : null,
    expenses_email: expenses ? JSON.parse(expenses) : null
  }
}

const saveBackup = async (email: string) => {
  const payload = getBackupPayload(email)
  await setDoc(doc(db, 'backup', email), payload, { merge: true })

  const today = new Date().toISOString().split('T')[0]
  setStoredBackupDate(email, today)
}

const setLocalStorageFromBackup = (
  email: string,
  backupData: {
    accounts_email?: unknown
    config_email?: unknown
    budget_email?: unknown
    categories?: unknown
    expenses_email?: unknown
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
}

const applyBackupIfChanged = (
  email: string,
  backupData: {
    device_id?: string
    accounts_email?: unknown
    config_email?: unknown
    budget_email?: unknown
    categories?: unknown
    expenses_email?: unknown
  }
) => {
  const deviceId = getDeviceId()

  if (backupData.device_id && backupData.device_id === deviceId) {
    return
  }

  const accountsKey = `accounts_${email}`
  const configKey = `config_${email}`
  const budgetKey = `budget_${email}`
  const categoriesKey = `categories_${email}`
  const expensesKey = `expenses_${email}`

  const currentAccounts = localStorage.getItem(accountsKey)
  const currentConfig = localStorage.getItem(configKey)
  const currentBudget = localStorage.getItem(budgetKey)
  const currentCategories = localStorage.getItem(categoriesKey)
  const currentExpenses = localStorage.getItem(expensesKey)

  const nextAccounts =
    backupData.accounts_email !== undefined
      ? JSON.stringify(backupData.accounts_email)
      : currentAccounts
  const nextConfig =
    backupData.config_email !== undefined
      ? JSON.stringify(backupData.config_email)
      : currentConfig
  const nextBudget =
    backupData.budget_email !== undefined
      ? JSON.stringify(backupData.budget_email)
      : currentBudget
  const nextCategories =
    backupData.categories !== undefined
      ? JSON.stringify(backupData.categories)
      : currentBudget
  const nextExpenses =
    backupData.expenses_email !== undefined
      ? JSON.stringify(backupData.expenses_email)
      : currentExpenses

  if (currentAccounts !== nextAccounts && nextAccounts !== null) {
    localStorage.setItem(accountsKey, nextAccounts)
  }

  if (currentConfig !== nextConfig && nextConfig !== null) {
    localStorage.setItem(configKey, nextConfig)
  }

  if (currentBudget !== nextBudget && nextBudget !== null) {
    localStorage.setItem(budgetKey, nextBudget)
  }

  if (currentCategories !== nextCategories && nextCategories !== null) {
    localStorage.setItem(categoriesKey, nextCategories)
  }

  if (currentExpenses !== nextExpenses && nextExpenses !== null) {
    localStorage.setItem(expensesKey, nextExpenses)
  }
}

export const backupService = {
  runBackupIfNeeded: async (email: string | null | undefined) => {
    if (!email || !shouldRunBackup(email)) {
      return
    }

    await saveBackup(email)
  },
  runBackupNow: async (email: string | null | undefined) => {
    if (!email) {
      return
    }

    await saveBackup(email)
  },
  restoreBackupIfAvailable: async (email: string | null | undefined) => {
    if (!email) {
      return
    }

    const snapshot = await getDoc(doc(db, 'backup', email))

    if (!snapshot.exists()) {
      return
    }

    const backupData = snapshot.data() as {
      device_id?: string
      accounts_email?: unknown
      config_email?: unknown
      budget_email?: unknown
      categories?: unknown
    }

    setLocalStorageFromBackup(email, backupData)
  },
  subscribeToBackup: (
    email: string | null | undefined,
    onChange?: () => void,
    onError?: (error: Error) => void
  ) => {
    if (!email) {
      return () => null
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null

    return onSnapshot(
      doc(db, 'backup', email),
      snapshot => {
        if (!snapshot.exists()) {
          return
        }

        const backupData = snapshot.data() as {
          device_id?: string
          accounts_email?: unknown
          config_email?: unknown
          budget_email?: unknown
          categories?: unknown
        }

        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        timeoutId = setTimeout(() => {
          applyBackupIfChanged(email, backupData)
          onChange?.()
        }, 500)
      },
      error => {
        if (onError) {
          onError(error as Error)
          return
        }

        console.error('Error syncing backup in realtime', error)
      }
    )
  },
  queueBackup: (() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    return (delayMs = 800) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(async () => {
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
    }
  })()
}
