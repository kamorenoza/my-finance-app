<template>
  <div class="account-expense">
    <div>
      <div
        v-bind="props"
        icon
        class="account-expense__category"
        :style="{
          backgroundColor: expense?.category?.backgroundColor || '#9e9e9e'
        }"
      >
        <v-icon size="16" :color="expense?.category?.iconColor || 'white'">
          {{ expense?.category?.icon || 'mdi-shape-plus' }}
        </v-icon>
      </div>
    </div>
    <div class="account-expense__content">
      <div class="account-expense__details">
        <p class="account-expense__desc">{{ expense.description }}</p>
        <p class="account-expense__comments">{{ expense.comments }}</p>
      </div>
      <div class="account-expense__info">
        <p
          v-currency-formatter="expense.value"
          class="account-expense__value"
          :class="expense.type === 'ingreso' ? 'positive' : 'negative'"
        ></p>
        <p v-date-formatter="expense.date" class="account-expense__date"></p>
        <div class="account-expense__actions">
          <dot-menu :items="itemMenu" @onMenuClicked="handleMenuAction" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DotMenu from '@/modules/shared/components/DotMenu.vue'
import type { Expense } from '../accounts.interface'
import { useConfirm } from '@/modules/shared/composables/useConfirm'
import { useAccountsStore } from '../accounts.store'
import { useToastStore } from '@/modules/shared/toast/toast.store'

interface Props {
  expense: Expense
  accountId: string
}
const props = defineProps<Props>()

const confirm = useConfirm()
const accountStore = useAccountsStore()
const toast = useToastStore()

const itemMenu = [
  { label: 'Editar', id: 1 },
  { label: 'Eliminar', id: 2 }
]

const handleMenuAction = (id: number) => {
  if (id === 1) {
    editExpense()
  } else if (id === 2) {
    deleteExpense()
  }
}

const editExpense = () => {
  console.log('Editar gasto')
}

const deleteExpense = async () => {
  const confirmed = await confirm({
    title: 'Eliminar movimiento',
    message: `Se eliminará el movimiento ${props.expense.description} ¿Está seguro?`,
    confirmColor: 'red'
  })

  if (confirmed) {
    if (!props.expense.id) return
    accountStore.deleteExpense(props.accountId, props.expense.id)
    toast.success('Movimiento eliminado')
  }
}
</script>

<style scoped lang="scss">
.account-expense {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
  width: 100%;

  &__category {
    border-radius: 8px !important;
    width: 30px !important;
    height: 30px !important;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-grow: 1;
    padding-right: 20px;
    position: relative;
  }

  &__info {
    p {
      text-align: right;
    }
  }

  &__desc {
    line-height: 1rem;
    font-size: 0.9rem;
    color: $text-gray;
  }

  &__value {
    font-family: $font-medium;
    line-height: 1rem;
    font-size: 0.9rem;

    &.positive {
      color: $color-green;
    }

    &.negative {
      color: $color-red;
    }
  }

  &__date {
    font-size: 0.6rem;
    color: $text-gray-md;
  }

  &__comments {
    font-size: 0.7rem;
    color: $text-gray-md;
  }

  &__actions {
    position: absolute;
    top: 0;
    right: -5px;
  }
}
</style>
