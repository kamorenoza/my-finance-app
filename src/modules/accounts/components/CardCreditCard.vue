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

      <div class="d-flex mt-5 justify-space-between align-center">
        <div>
          <div class="credit-card__fixed">
            <span class="credit-card__label">Saldo</span>
            <span class="credit-card__saldo">{{ getLoanAmount }}</span>
          </div>
          <div class="credit-card__fixed">
            <span class="credit-card__label">Cupo</span>
            <span class="credit-card__fixed-label">{{ getCreditLimit }}</span>
          </div>
          <div class="credit-card__fixed">
            <span class="credit-card__label">Libre</span>
            <span class="credit-card__fixed-label">{{ getFreeCredit }}</span>
          </div>
        </div>
        <div>
          <div class="credit-card__dates">
            <p class="credit-card__label">Corte</p>
            <p class="credit-card__fixed-label">
              {{ account.cutoffDate }} de cada mes
            </p>
          </div>

          <div class="credit-card__dates mt-5">
            <p class="credit-card__label">Pago</p>
            <p class="credit-card__fixed-label">
              {{ account.dueDate }} de cada mes
            </p>
          </div>
        </div>
      </div>
    </v-card>

    <div v-if="fromPreview" class="credit-card__actions">
      <v-btn
        class="btn-icon credit-card__action"
        @click="editAccount"
        :ripple="false"
      >
        <EditIcon :color="red" />
        <span class="label-display">Editar cuenta</span>
      </v-btn>

      <v-btn
        class="btn-icon credit-card__action"
        @click="deleteAccount"
        :ripple="false"
      >
        <TrashIcon :color="red" />
        <span class="label-display">Eliminar cuenta</span>
      </v-btn>

      <v-btn
        class="btn-icon credit-card__action"
        @click="backToAccounts"
        :ripple="false"
      >
        <v-icon left>mdi-arrow-left</v-icon>
        <span class="label-display">Volver a cuentas</span>
      </v-btn>
    </div>
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
import TrashIcon from '@/assets/icons/Trash.icon.vue'
import EditIcon from '@/assets/icons/Edit.icon.vue'
import { useConfirm } from '@/modules/shared/composables/useConfirm'
import { useAccountsStore } from '../accounts.store'
import { useToastStore } from '@/modules/shared/toast/toast.store'
import AddAccount from './AddAccount.vue'
import { currencyFormatter } from '@/modules/shared/utils'
import CreditCardIcon from '@/assets/icons/CreditCard.icon.vue'
import { red } from '@/styles/variables.styles'

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

const editAccount = (event: Event) => {
  event.stopPropagation()
  openEditAccount.value = true
}

const onEditClose = () => {
  openEditAccount.value = false
}

const deleteAccount = async (event: Event) => {
  event.stopPropagation()
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

const backToAccounts = (event: Event) => {
  event.stopPropagation()
  router.push({ name: 'cuentas' })
}
</script>

<style scoped lang="scss">
.credit-card {
  &__container {
    overflow: hidden;
    position: relative;

    @media (min-width: 960px) {
      overflow: visible;
      width: 100%;
    }
  }

  background-color: $card-red-lg;
  padding: 15px;
  border-radius: 16px;
  box-shadow: none;
  position: relative;
  height: 166px;
  overflow: hidden;
  width: 100%;

  @media (min-width: 960px) {
    &.no-click {
      overflow: visible;
      max-width: 400px;
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
    background-color: $card-red-md;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    width: 45px;
    height: 45px;
    margin-right: 3px;

    .icon {
      width: 38px;
      height: 38px;
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
    width: 40px;
  }

  &__value {
    font-size: 20px;
    font-family: $font-medium;
  }

  &__fixed {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
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
    top: 10px;
    right: 10px;
    display: flex;
    gap: 8px;

    @media (min-width: 960px) {
      flex-direction: column;
    }
  }

  &__action {
    background-color: $card-red-md;
    width: 35px !important;
    height: 35px !important;
    background-color: $white;
    box-shadow: none;

    .icon {
      width: 20px;
      height: 20px;
      fill: $white;
    }

    .label-display {
      display: none;
    }

    @media (min-width: 960px) {
      width: auto !important;
      text-align: start;
      justify-content: start;
      padding: 0 10px !important;
      align-items: center;

      .label-display {
        margin-left: 5px;
        display: inline;
        text-transform: none;
        letter-spacing: 1px;
      }
    }
  }

  &__dates {
    .credit-card__label {
      font-size: 11px;
      color: $text-dark;
    }
  }
}
</style>
