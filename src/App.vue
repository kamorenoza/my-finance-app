<template>
  <v-app>
    <v-main>
      <div class="user-menu">
        <v-menu location="bottom">
          <template #activator="{ props }">
            <div class="user-menu__trigger" v-bind="props">user</div>
          </template>
          <v-list class="user-menu-list">
            <v-list-item @click="handleLogout">
              <v-list-item-title>Cerrar sesión</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
      <LoadingScreen v-if="authStore.loading" />
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useAuthListener } from '@/modules/auth/composables/useAuthListener'
import { useAuthStore } from './modules/auth/auth.store'
import LoadingScreen from './modules/shared/components/LoadingScreen.vue'
import { auth } from '@/database/firebase'
import { signOut } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { backupService } from '@/modules/shared/services/backup.service'
import { useAccountsStore } from '@/modules/accounts/accounts.store'
import { useCategoryStore } from '@/modules/categories/categories.store'

const user = localStorage.getItem('user')
const authStore = useAuthStore()
const router = useRouter()
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

const handleLogout = async () => {
  await backupService.runBackupNow(authStore.user?.email)
  await signOut(auth)
  localStorage.removeItem('user')
  authStore.logout()
  authStore.setLoading(false)
  await router.push('/login')
}
</script>

<style lang="scss">
.text-gray {
  color: $color-grey;
}

.text-medium {
  font-family: $font-medium;
  font-weight: 400;
}

.user-menu {
  display: flex;
  justify-content: flex-end;
  padding: 8px 16px;
  position: absolute;
  right: 0;
  z-index: 8;
  top: 5px;

  @media (min-width: 960px) {
    z-index: 910;
    top: 12px;
  }
}

.user-menu__trigger {
  cursor: pointer;
  font-weight: 600;
  color: $color-primary;
}

.v-menu .v-overlay__content:has(.user-menu-list) {
  min-width: 200px !important;
}
</style>
