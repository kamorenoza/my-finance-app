<template>
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

      <div v-if="fromPreview" class="normal-card__actions">
        <v-btn
          class="btn-icon normal-card__action"
          @click="editAccount"
          :ripple="false"
        >
          <EditIcon />
        </v-btn>

        <v-btn
          class="btn-icon normal-card__action"
          @click="deleteAccount"
          :ripple="false"
        >
          <TrashIcon />
        </v-btn>
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
  </v-card>
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
import TrashIcon from '@/assets/icons/Trash.icon.vue'
import EditIcon from '@/assets/icons/Edit.icon.vue'
import { useConfirm } from '@/modules/shared/composables/useConfirm'
import { useAccountsStore } from '../accounts.store'
import { useToastStore } from '@/modules/shared/toast/toast.store'
import AddAccount from './AddAccount.vue'
import { currencyFormatter } from '@/modules/shared/utils'

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
</script>

<style scoped lang="scss">
.normal-card {
  background-color: $card-green-lg;
  padding: 15px;
  border-radius: 16px;
  box-shadow: none;
  position: relative;

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
    font-size: 13px;
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
    margin-top: 15px;
  }

  &__fixed-label {
    font-size: 13px;
    color: $text-gray-md;
    line-height: 13px;
    font-family: $font-medium;
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
  }

  &__action {
    background-color: $card-green-md;
    width: 35px !important;
    height: 35px !important;
    background-color: $white;
    box-shadow: none;

    .icon {
      width: 20px;
      height: 20px;
      fill: $white;
    }
  }
}
</style>
