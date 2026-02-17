<template>
  <v-app>
    <v-main>
      <router-view />
      <LoadingScreen
        v-show="authStore.loading || isInitializing"
        class="overlay-loader"
      />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useAuthListener } from '@/modules/auth/composables/useAuthListener'
import { useAuthStore } from './modules/auth/auth.store'
import LoadingScreen from './modules/shared/components/LoadingScreen.vue'
import { onMounted, onBeforeUnmount, watch, ref } from 'vue'
import { backupService } from '@/modules/shared/services/backup.service'

const user = localStorage.getItem('user')
const authStore = useAuthStore()
const isInitializing = ref(true)

// Lazy load de stores para no bloquear inicio
let accountsStore: any = null
let categoryStore: any = null
let budgetStore: any = null
let expensesStore: any = null
let shoppingStore: any = null

const loadStores = async () => {
  if (!accountsStore) {
    const { useAccountsStore } = await import(
      '@/modules/accounts/accounts.store'
    )
    accountsStore = useAccountsStore()
  }
  if (!categoryStore) {
    const { useCategoryStore } = await import(
      '@/modules/categories/categories.store'
    )
    categoryStore = useCategoryStore()
  }
  if (!budgetStore) {
    const { useBudgetStore } = await import('@/modules/budget/budget.store')
    budgetStore = useBudgetStore()
  }
  if (!expensesStore) {
    const { useExpensesStore } = await import(
      '@/modules/expenses/expenses.store'
    )
    expensesStore = useExpensesStore()
  }
  if (!shoppingStore) {
    const { useShoppingStore } = await import(
      '@/modules/shopping/shopping.store'
    )
    shoppingStore = useShoppingStore()
  }
}

if (user) {
  authStore.setUser(JSON.parse(user))
} else {
  useAuthListener()
  isInitializing.value = false
}

let unsubscribeBackup: (() => void) | null = null

const startBackupSubscription = async (email?: string | null) => {
  if (unsubscribeBackup) {
    unsubscribeBackup()
    unsubscribeBackup = null
  }

  if (email) {
    await loadStores()
    unsubscribeBackup = backupService.subscribeToBackup(email, () => {
      accountsStore?.loadAccounts()
      categoryStore?.loadCategories()
      budgetStore?.loadEntries()
      expensesStore?.loadExpenses()
      shoppingStore?.loadShoppingLists()
    })
  }
}

const runRestoreAndBackup = async () => {
  const email = authStore.user?.email
  const wasLoadingInitially = authStore.loading

  await backupService.restoreBackupIfAvailable(email)
  await backupService.runBackupIfNeeded(email)

  await startBackupSubscription(email)

  // Solo finalizar el estado de carga si estaba en loading
  // (si no estaba en loading, es porque ya había datos locales)
  if (wasLoadingInitially) {
    authStore.setLoading(false)
  }

  isInitializing.value = false
}

onMounted(async () => {
  // Solo ejecutar si ya hay un usuario autenticado
  if (!authStore.user?.email) {
    isInitializing.value = false
    return
  }

  // Si está en loading (no hay datos locales), esperar la restauración
  // Si no está en loading (hay datos locales), ejecutar en segundo plano
  if (authStore.loading) {
    await runRestoreAndBackup()
  } else {
    runRestoreAndBackup() // Sin await - en segundo plano
    isInitializing.value = false
  }
})

watch(
  () => authStore.user?.email,
  async (newEmail, oldEmail) => {
    if (!newEmail) return

    // Si hay cambio de usuario (login inicial o cambio de cuenta)
    // siempre esperamos la restauración
    if (oldEmail !== newEmail) {
      authStore.setLoading(true)
      await runRestoreAndBackup()
    }
  }
)

onBeforeUnmount(() => {
  if (unsubscribeBackup) {
    unsubscribeBackup()
    unsubscribeBackup = null
  }
})
</script>

<style lang="scss">
.text-gray {
  color: $color-grey;
}

.text-medium {
  font-family: $font-medium;
  font-weight: 400;
}

.overlay-loader {
  position: fixed;
  inset: 0;
  z-index: 9999;
}
</style>
