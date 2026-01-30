<template>
  <div class="normal-card__container">
    <v-card
      class="normal-card"
      @click="onCardClick"
      :class="{ 'no-click': fromPreview }"
    >
      <div class="normal-card__header">
        <div class="normal-card__icon">
          <SuitcaseIcon />
        </div>

        <div>
          <h3 class="normal-card__title">{{ account.name }}</h3>
          <p class="normal-card__type">{{ type }}</p>
        </div>
      </div>

      <div class="normal-card__balance">
        <div class="normal-card__label">Saldo</div>
        <div class="normal-card__value">{{ calculateBalance }}</div>
      </div>

      <div class="normal-card__fixed">
        <span class="normal-card__label">Saldo real</span>
        <span class="normal-card__fixed-label">{{ calculateRealBalance }}</span>
      </div>
      <div v-if="fromPreview" class="normal-card__actions">
        <DotMenu :items="itemMenu" @onMenuClicked="handleMenuAction">
          <div class="normal-card__menu">
            <v-icon>mdi-dots-horizontal</v-icon>
          </div>
        </DotMenu>
      </div>
    </v-card>
  </div>
  <AddAccount
    :account="account"
    :drawer="openEditAccount"
    @close="onEditClose"
  />
</template>

<script setup lang="ts">
import SuitcaseIcon from '@/assets/icons/Suitcase.icon.vue'
import { type Account } from '../accounts.interface'
import { computed, ref } from 'vue'
import { AccountTypes } from '../accounts.constants'
import { useRouter } from 'vue-router'
import { useConfirm } from '@/modules/shared/composables/useConfirm'
import { useAccountsStore } from '../accounts.store'
import { useToastStore } from '@/modules/shared/toast/toast.store'
import AddAccount from './AddAccount.vue'
import { currencyFormatter } from '@/modules/shared/utils'
import EditIcon from '@/assets/icons/Edit.icon.vue'
import TrashIcon from '@/assets/icons/Trash.icon.vue'
import DotMenu from '@/modules/shared/components/DotMenu.vue'

interface Props {
  account: Account
  fromPreview?: boolean
}

const itemMenu = [
  { label: 'Editar', id: 1, icon: EditIcon },
  { label: 'Eliminar', id: 2, icon: TrashIcon }
]

const props = defineProps<Props>()
const router = useRouter()
const confirm = useConfirm()
const accountStore = useAccountsStore()
const toast = useToastStore()

const openEditAccount = ref(false)

const calculateBalance = computed(() => {
  let total = 0
  const expenses = props.account.expenses ?? []

  expenses.forEach(exp => {
    if (!exp.isPending) {
      if (exp.type === 'ingreso') {
        total += exp.value
      } else {
        total -= exp.value
      }
    }
  })

  return currencyFormatter(total)
})

const calculateRealBalance = computed(() => {
  let total = 0
  const expenses = props.account.expenses ?? []

  expenses.forEach(exp => {
    if (exp.type === 'ingreso') {
      total += exp.value
    } else {
      total -= exp.value
    }
  })

  return currencyFormatter(total)
})

const type = computed(() => {
  if (props.account.type === AccountTypes.normal) {
    return 'Ahorros'
  } else if (props.account.type === AccountTypes.TC) {
    return 'Tarjeta de crédito'
  } else {
    return 'Préstamo'
  }
})

const onCardClick = () => {
  if (props.fromPreview) return
  router.push({ name: 'cuentas-detalle', params: { id: props.account.id } })
}

const handleMenuAction = (id: number) => {
  if (id === 1) {
    editAccount()
  } else if (id === 2) {
    deleteAccount()
  }
}

const editAccount = () => {
  openEditAccount.value = true
}

const onEditClose = () => {
  openEditAccount.value = false
}

const deleteAccount = async () => {
  const confirmed = await confirm({
    title: 'Eliminar cuenta',
    message: `Se eliminará la cuenta <strong>${props.account.name}</strong> y toda su información, <strong>este proceso es IRREVERSIBLE</strong> ¿Está seguro?`,
    confirmColor: 'red'
  })

  if (confirmed) {
    accountStore.deleteAccount(props.account)
    toast.success('Cuenta eliminada')
    router.push({ name: 'cuentas' })
  }
}
</script>

<style scoped lang="scss">
.normal-card {
  &__container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (min-width: 960px) {
      justify-content: flex-start;
      max-width: 540px;
    }
  }

  background-color: $card-green-lg;
  padding: 20px 25px 20px 23px;
  padding-top: 17px;
  border-radius: 40px;
  box-shadow: none;
  position: relative;
  height: 166px;
  overflow: hidden;
  width: 100%;

  @media (min-width: 960px) {
    &.no-click {
      overflow: visible;
    }
  }

  &.no-click {
    cursor: default;
    pointer-events: none;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  &__icon {
    background-color: $card-green-md;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 15px;
    width: 45px;
    height: 45px;
    margin-right: 3px;

    .icon {
      width: 35px;
      height: 35px;
    }
  }

  &__title {
    text-transform: capitalize;
    line-height: 16px;
  }

  &__balance {
    margin-top: 20px;
  }

  &__label {
    font-size: 12px;
    color: $text-gray-md;
    line-height: 13px;
  }

  &__value {
    font-size: 20px;
    font-family: $font-medium;
  }

  &__fixed {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding-top: 10px;
  }

  &__fixed-label {
    font-size: 13px;
    color: $text-gray-md;
    line-height: 13px;
    font-family: $font-medium;
  }

  &__saldo {
    font-size: 13px;
    line-height: 13px;
    font-family: $font-medium;
    color: $card-green;
  }

  &__type {
    font-size: 11px;
    line-height: 11px;
    color: $text-gray-md;
    margin-top: 4px;
  }

  &__actions {
    position: absolute;
    z-index: 9;
    pointer-events: all;
    top: 18px;
    right: 35px;
  }

  &__menu {
    background-color: $white;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 100%;
  }

  &__dates {
    .normal-card__label {
      font-size: 11px;
      color: $text-dark;
    }
  }
}

:deep(.normal-card__menu .v-icon) {
  color: $text-gray !important;
  opacity: 1 !important;
}

:deep(.normal-card__actions .v-btn) {
  opacity: 1 !important;
}
</style>
