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

const initStoresAndSync = async (email?: string | null) => {
  if (!email) return

  await loadStores()

  // Compare timestamps: if Firebase is newer, pull data then reload stores
  const dataUpdated = await backupService.checkAndSyncIfNeeded(email)
  if (dataUpdated) {
    accountsStore?.loadAccounts()
    categoryStore?.loadCategories()
    budgetStore?.loadEntries()
    expensesStore?.loadExpenses()
    shoppingStore?.loadShoppingLists()
  }
}

const runRestoreAndBackup = async () => {
  const email = authStore.user?.email

  // Check if Firebase has newer data (another device updated) and sync if so
  await initStoresAndSync(email)

  // Weekly backup — fire-and-forget, never blocks startup
  backupService.checkAndRunWeeklyBackup(email)

  authStore.setLoading(false)
  isInitializing.value = false
}

const handleAppHide = () => {
  if (document.visibilityState === 'hidden') {
    backupService.flushPendingBackup()
  }
}

const handlePageHide = () => {
  backupService.flushPendingBackup()
}

onMounted(async () => {
  document.addEventListener('visibilitychange', handleAppHide)
  window.addEventListener('pagehide', handlePageHide)

  if (!authStore.user?.email) {
    isInitializing.value = false
    return
  }

  runRestoreAndBackup() // always fire-and-forget, sets isInitializing/loading when done
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
  document.removeEventListener('visibilitychange', handleAppHide)
  window.removeEventListener('pagehide', handlePageHide)
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
