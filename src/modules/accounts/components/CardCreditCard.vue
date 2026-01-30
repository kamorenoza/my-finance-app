<template>
  <div class="credit-card__container">
    <v-card
      class="credit-card"
      @click="onCardClick"
      :class="{ 'no-click': fromPreview }"
    >
      <div class="credit-card__header">
        <div class="credit-card__icon">
          <CreditCardIcon />
        </div>

        <div>
          <h3 class="credit-card__title">{{ account.name }}</h3>
          <p class="credit-card__type">{{ type }}</p>
        </div>
      </div>

      <div class="credit-card__balance">
        <div class="credit-card__label">Saldo</div>
        <div class="credit-card__value">{{ getLoanAmount }}</div>
      </div>

      <div class="credit-card__fixed">
        <span class="credit-card__label">Libre</span>
        <span class="credit-card__fixed-label">{{ getFreeCredit }}</span>
      </div>

      <div class="d-flex justify-end mt-1">
        <div class="credit-card__fixed">
          <span class="credit-card__label">Cupo</span>
          <span class="credit-card__fixed-label">{{ getCreditLimit }}</span>
        </div>
      </div>
      <div v-if="fromPreview" class="credit-card__actions">
        <DotMenu :items="itemMenu" @onMenuClicked="handleMenuAction">
          <div class="credit-card__menu">
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
import { type Account } from '../accounts.interface'
import { computed, ref } from 'vue'
import { AccountTypes } from '../accounts.constants'
import { useRouter } from 'vue-router'
import { useConfirm } from '@/modules/shared/composables/useConfirm'
import { useAccountsStore } from '../accounts.store'
import { useToastStore } from '@/modules/shared/toast/toast.store'
import AddAccount from './AddAccount.vue'
import { currencyFormatter } from '@/modules/shared/utils'
import CreditCardIcon from '@/assets/icons/CreditCard.icon.vue'
import DotMenu from '@/modules/shared/components/DotMenu.vue'
import EditIcon from '@/assets/icons/Edit.icon.vue'
import TrashIcon from '@/assets/icons/Trash.icon.vue'

interface Props {
  account: Account
  fromPreview?: boolean
}

const props = defineProps<Props>()
const router = useRouter()
const confirm = useConfirm()
const accountStore = useAccountsStore()
const toast = useToastStore()

const openEditAccount = ref(false)
const itemMenu = [
  { label: 'Editar', id: 1, icon: EditIcon },
  { label: 'Eliminar', id: 2, icon: TrashIcon }
]

const getCreditLimit = computed(() => {
  return currencyFormatter(props.account.creditLimit || 0)
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

const getLoanAmount = computed(() => {
  if (!props.account.expenses || props.account.expenses.length === 0) {
    return '$ 0'
  }

  const total = props.account.expenses.reduce((acc, exp) => {
    const value = Number(exp.value) || 0
    return exp.type === 'ingreso' ? acc + value : acc - value
  }, 0)

  const formatted = currencyFormatter(Math.abs(total))
  return formatted || '$ 0'
})

const getFreeCredit = computed(() => {
  const total = props.account.expenses?.reduce((total, exp) => {
    if (exp.type === 'ingreso') {
      return total + exp.value
    } else {
      return total - exp.value
    }
  }, 0)

  const freeCredit = props.account.creditLimit
    ? props.account.creditLimit + (total || 0)
    : 0

  return currencyFormatter(freeCredit)
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
.credit-card {
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

  background-color: $card-red-lg;
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
      //max-width: 400px;
    }
  }

  &.no-click {
    cursor: default;
    pointer-events: none;
    //max-width: 400px;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  &__icon {
    background-color: $card-red-md;
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
    display: flex;
    align-items: center;
    gap: 10px;
    padding-bottom: 3px;
  }

  &__label {
    font-size: 12px;
    color: $text-gray-md;
    line-height: 13px;
    width: 40px;
  }

  &__value {
    font-size: 20px;
    font-family: $font-medium;
    color: $card-red;
  }

  &__fixed {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  &__fixed-label {
    font-size: 13px;
    color: $text-dark;
    line-height: 13px;
  }

  &__saldo {
    font-size: 13px;
    line-height: 13px;
    font-family: $font-medium;
    color: $card-red;
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
    .credit-card__label {
      font-size: 11px;
    }
  }
}

:deep(.credit-card__menu .v-icon) {
  color: $text-gray !important;
  opacity: 1 !important;
}

:deep(.credit-card__actions .v-btn) {
  opacity: 1 !important;
}
</style>
