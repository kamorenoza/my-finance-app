<template>
  <div class="user-view">
    <PageHeader title="Perfil" />
    <div class="user-view__content">
      <span class="user-view__logout" @click="handleLogout">Cerrar sesión</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import PageHeader from '../shared/components/PageHeader.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/auth.store'
import { useConfirm } from '../shared/composables/useConfirm'
import { backupService } from '../shared/services/backup.service'
import { signOut } from 'firebase/auth'
import { auth } from '@/database/firebase'

const router = useRouter()
const authStore = useAuthStore()
const confirm = useConfirm()

const handleLogout = async () => {
  const confirmed = await confirm({
    title: 'Cerrar sesión',
    message: `¿Está seguro?`,
    confirmColor: 'red'
  })

  if (!confirmed) return

  await backupService.runBackupNow(authStore.user?.email)
  await signOut(auth)
  localStorage.removeItem('user')
  authStore.logout()
  authStore.setLoading(false)
  await router.push('/login')
}
</script>

<style lang="scss" scoped>
.user-view {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__content {
    padding: 16px;
  }

  &__logout {
    cursor: pointer;
    color: $red;
    font-size: 14px;
  }
}
</style>
