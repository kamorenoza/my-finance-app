<template>
  <v-app>
    <v-main>
      <LoadingScreen v-if="authStore.loading" />
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useAuthListener } from '@/modules/auth/composables/useAuthListener'
import { useAuthStore } from './modules/auth/auth.store'
import LoadingScreen from './modules/shared/components/LoadingScreen.vue'
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { backupService } from '@/modules/shared/services/backup.service'
import { useAccountsStore } from '@/modules/accounts/accounts.store'
import { useCategoryStore } from '@/modules/categories/categories.store'

const user = localStorage.getItem('user')
const authStore = useAuthStore()
const accountsStore = useAccountsStore()
const categoryStore = useCategoryStore()

if (user) {
  authStore.setUser(JSON.parse(user))
  authStore.setLoading(false)
} else {
  useAuthListener()
}

let unsubscribeBackup: (() => void) | null = null

const startBackupSubscription = (email?: string | null) => {
  if (unsubscribeBackup) {
    unsubscribeBackup()
    unsubscribeBackup = null
  }

  if (email) {
    unsubscribeBackup = backupService.subscribeToBackup(email, () => {
      accountsStore.loadAccounts()
      categoryStore.loadCategories()
    })
  }
}

const runRestoreAndBackup = async () => {
  const email = authStore.user?.email

  await backupService.restoreBackupIfAvailable(email)
  await backupService.runBackupIfNeeded(email)

  startBackupSubscription(email)
}

onMounted(async () => {
  await runRestoreAndBackup()
})

watch(
  () => authStore.user?.email,
  async newEmail => {
    if (!newEmail) return
    await runRestoreAndBackup()
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
</style>
