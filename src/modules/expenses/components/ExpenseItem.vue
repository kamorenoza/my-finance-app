<template>
  <div class="expense-item">
    <div class="expense-item__content">
      <div class="expense-item__info">
        <div class="expense-item__header">
          <p class="expense-item__name">{{ expense.name }}</p>
          <v-menu v-if="!readOnly && expense.account">
            <template #activator="{ props }">
              <span v-bind="props" class="badge account" @click.stop>
                {{ accountName }}
              </span>
            </template>
            <v-list density="compact">
              <v-list-item
                v-for="acc in accounts"
                :key="acc.id"
                @click="selectAccount(acc)"
              >
                <v-list-item-title>{{ acc.name }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <span
            v-else-if="readOnly && expense.account"
            class="badge account readonly"
          >
            {{ accountName }}
          </span>
        </div>
        <p v-if="expense.date" class="expense-item__date">{{ displayDate }}</p>
      </div>
      <div>
        <div class="expense-item__amount">
          {{ currency(expense.value) }}
        </div>
      </div>
    </div>

    <div v-if="!readOnly" class="expense-item__actions">
      <v-btn
        icon
        variant="plain"
        :ripple="false"
        class="btn-label expense-item__edit"
        @click="editExpense"
      >
        <v-icon size="24">mdi-chevron-right</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { Expense, AccountReference } from '../expenses.interface'
import dayjs from 'dayjs'
import { useAccountsStore } from '@/modules/accounts/accounts.store'

interface Props {
  expense: Expense
  readOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readOnly: false
})

const emit = defineEmits<{
  edit: [expense: Expense]
  updateAccount: [expenseId: string, account: AccountReference | null]
}>()

const accountsStore = useAccountsStore()

const accounts = computed(() => accountsStore.accounts)

const accountName = computed(() => {
  if (!props.expense.account) return 'Presupuesto'
  return props.expense.account.name
})

const displayDate = computed(() => {
  if (!props.expense.date) return ''
  return dayjs(props.expense.date).format('D MMM YYYY')
})

const editExpense = () => {
  emit('edit', props.expense)
}

const selectAccount = (account: any | null) => {
  const accountRef = account ? { id: account.id, name: account.name } : null
  emit('updateAccount', props.expense.id, accountRef)
}

const currency = (value: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value)
</script>

<style scoped lang="scss">
@import '@/styles/_variables.scss';

.expense-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 30px 12px 12px;
  background-color: $bg-item;
  border-radius: 12px;
  margin-bottom: 0px;
  position: relative;

  &:has(.expense-item__actions) {
    padding-right: 30px;
  }

  &:not(:has(.expense-item__actions)) {
    padding-right: 12px;
  }

  &__content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex: 1;
    gap: 15px;
    min-width: 0;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 5px;
    min-width: 0;
  }

  &__name {
    font-size: 0.9rem;
    margin: 0;
    flex-shrink: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
    text-transform: capitalize;
  }

  &__amount {
    font-family: $font-medium;
    font-size: 0.9rem;
    color: $color-red;
    white-space: nowrap;
    flex-shrink: 0;
  }

  &__actions {
    position: absolute;
    top: 48%;
    right: -8px;
    transform: translateY(-50%);
    flex-shrink: 0;
  }

  &__date {
    font-size: 0.7rem;
    line-height: 0.8rem;
    color: $text-gray-md;
    margin: 0;
  }

  &__account {
    font-size: 0.7rem;
    color: $text-gray-md;
    margin: 0;
  }
}

.badge {
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.6rem;
  font-weight: 500;
  display: inline-block;
  white-space: nowrap;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.2s ease;

  &.account {
    background-color: $blue-md;
    color: $blue;
    font-family: $font-medium;

    &:hover {
      background-color: #bbdefb;
    }

    &.readonly {
      cursor: default;

      &:hover {
        background-color: $blue-md;
      }
    }
  }
}
</style>
