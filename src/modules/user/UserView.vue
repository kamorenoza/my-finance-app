<template>
  <div class="user-view">
    <PageHeader title="Perfil" />
    <div class="user-view__content">
      <!-- Sección de Configuración -->
      <div class="user-view__section">
        <h3 class="user-view__section-title">Configuración</h3>

        <div class="user-view__config-item">
          <div class="user-view__config-text">
            <p class="user-view__config-label">Modo de cálculo del presupuesto</p>
            <p class="user-view__config-description">
              {{ budgetModeDescription }}
            </p>
          </div>

          <label class="user-view__toggle">
            <input
              type="checkbox"
              v-model="isBudgetByCategory"
              @change="handleBudgetModeChange"
            />
            <span class="user-view__toggle-slider"></span>
          </label>
        </div>
      </div>

      <!-- Cerrar sesión -->
      <div class="user-view__logout" @click="handleLogout">Cerrar sesión</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import PageHeader from '../shared/components/PageHeader.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/auth.store'
import { useConfirm } from '../shared/composables/useConfirm'
import { backupService } from '../shared/services/backup.service'
import { useBudgetStore } from '@/modules/budget/budget.store'
import { signOut } from 'firebase/auth'
import { auth } from '@/database/firebase'
import { ref, computed } from 'vue'

const router = useRouter()
const authStore = useAuthStore()
const confirm = useConfirm()
const budgetStore = useBudgetStore()

// Cargar configuración inicial
const isBudgetByCategory = ref(budgetStore.isByCategoryMode)

// Descripción dinámica según el estado del toggle
const budgetModeDescription = computed(() => {
  if (isBudgetByCategory.value) {
    return 'Activado: Cada categoría gestiona su propio presupuesto de forma independiente'
  }
  return 'Desactivado: Los ingresos y gastos se calculan de manera consolidada'
})

const handleBudgetModeChange = async () => {
  const targetMode = isBudgetByCategory.value ? 'byCategory' : 'general'

  const confirmed = await confirm({
    title: 'Cambiar modo de cálculo',
    message: '¿Seguro que quieres cambiar el modo de cálculo del presupuesto?',
    confirmColor: 'primary'
  })

  if (!confirmed) {
    isBudgetByCategory.value = !isBudgetByCategory.value
    return
  }

  budgetStore.setCalculationMode(targetMode)
}

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

  @media (min-width: 960px) {
    padding: 0 24px;
  }

  &__content {
    padding: 16px;
  }

  &__section {
    margin-bottom: 24px;
  }

  &__section-title {
    font-family: $font-medium;
    font-size: 16px;
    color: $text-dark;
    margin: 0 0 16px 0;
  }

  &__config-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 16px;
    background: $white;
    border-radius: 12px;
    margin-bottom: 12px;
  }

  &__config-text {
    flex: 1;
  }

  &__config-label {
    font-family: $font-medium;
    font-size: 14px;
    color: $text-dark;
    margin: 0 0 4px 0;
  }

  &__config-description {
    font-family: $font;
    font-size: 12px;
    color: $text-gray-md;
    margin: 0;
    line-height: 1.5;
  }

  // Toggle switch
  &__toggle {
    position: relative;
    display: inline-block;
    width: 48px;
    height: 28px;
    flex-shrink: 0;

    input {
      opacity: 0;
      width: 0;
      height: 0;

      &:checked + .user-view__toggle-slider {
        background-color: $color-primary;
      }

      &:checked + .user-view__toggle-slider:before {
        transform: translateX(20px);
      }

      &:focus + .user-view__toggle-slider {
        box-shadow: 0 0 0 2px rgba($color-primary, 0.2);
      }
    }
  }

  &__toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: $text-gray-lg;
    border-radius: 28px;
    transition: background-color 0.3s ease;

    &:before {
      content: '';
      position: absolute;
      height: 22px;
      width: 22px;
      left: 3px;
      bottom: 3px;
      background-color: $white;
      border-radius: 50%;
      transition: transform 0.3s ease;
    }
  }

  &__logout {
    cursor: pointer;
    color: $red;
    font-family: $font;
    font-size: 14px;
    margin-top: 8px;
  }
}
</style>