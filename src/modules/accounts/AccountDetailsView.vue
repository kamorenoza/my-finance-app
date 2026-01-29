<template>
  <div class="account-preview">
    <div class="account-preview__content">
      <div class="pr15">
        <NormalCard
          :account="account"
          :from-preview="true"
          v-if="account.type === 'normal'"
        />
        <CardCreditCard
          :account="account"
          :from-preview="true"
          v-if="account.type === 'TC'"
        />
      </div>

      <div class="account-preview__header pr15">
        <AccountDetailsFilter
          :account-id="accountId"
          :initial-group-by="currentFilter.groupBy"
          :initial-order-by="currentFilter.orderBy"
          @filterChange="onFilterChange"
        />
      </div>
      <div class="account-preview__body">
        <AccountDetailsExpensesNormal
          :account-id="accountId"
          :filters="currentFilter"
          v-if="account.type === 'normal'"
          @updateExpenses="onExpensesUpdate"
        />

        <AccountDetailsExpensesCreditCard
          :account-id="accountId"
          :filters="currentFilter"
          v-if="account.type === 'TC'"
          @updateExpenses="onExpensesUpdate"
        />
      </div>

      <div class="account-preview__summary">
        <div class="account-preview__summary-item">
          <p>Total ingresos <span v-if="!hasActiveFilters">del mes</span></p>
          <p class="value ingreso">{{ getTotalIngresos }}</p>
        </div>

        <div class="account-preview__summary-item">
          <p>Total gastos <span v-if="!hasActiveFilters">del mes</span></p>
          <p class="value gasto">{{ getTotalGastos }}</p>
        </div>

        <div class="account-preview__summary-item">
          <p>Total movimientos <span v-if="!hasActiveFilters">del mes</span></p>
          <p class="value">{{ getTotalMovimientos }}</p>
        </div>
      </div>

      <AddAccountExpense class="fixed-bottom" :accountId="accountId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAccountsStore } from '@/modules/accounts/accounts.store'
import { configService } from '@/modules/accounts/config.service'
import type { Expense } from '@/modules/accounts/accounts.interface'
import AddAccountExpense from './components/AddAccountExpense.vue'
import NormalCard from './components/NormalCard.vue'
import AccountDetailsFilter from './components/AccountDetailsFilter.vue'
import AccountDetailsExpensesNormal from './components/AccountDetailsExpensesNormal.vue'
import AccountDetailsExpensesCreditCard from './components/AccountDetailsExpensesCreditCard.vue'
import CardCreditCard from './components/CardCreditCard.vue'
import { currencyFormatter } from '../shared/utils'

const route = useRoute()
const store = useAccountsStore()
const accountId = route.params.id as string
const account = computed(() => store.getAccountById(accountId)!)

const currentFilter = ref({
  search: '',
  groupBy: account.value.type === 'TC' ? 'none' : ('category' as string | null),
  orderBy: null as string | null,
  initDate: null as Date | null,
  endDate: null as Date | null
})

// Load configuration when component mounts
onMounted(() => {
  if (account.value.type === 'TC') {
    currentFilter.value.groupBy = 'none'
  }

  const savedConfig = configService.getAccountConfig(accountId)
  if (savedConfig.groupBy !== undefined) {
    currentFilter.value.groupBy = savedConfig.groupBy
  }
  if (savedConfig.orderBy !== undefined) {
    currentFilter.value.orderBy = savedConfig.orderBy
  }
})

// Save configuration when filter changes
watch(
  () => currentFilter.value,
  newFilter => {
    configService.saveAccountConfig(accountId, {
      groupBy: newFilter.groupBy,
      orderBy: newFilter.orderBy
    })
  },
  { deep: true }
)

const onFilterChange = (filter: {
  search: string
  groupBy: string | null
  orderBy: string | null
  initDate?: Date | null
  endDate?: Date | null
}) => {
  currentFilter.value = {
    search: filter.search,
    groupBy: filter.groupBy,
    orderBy: filter.orderBy,
    initDate: filter.initDate || null,
    endDate: filter.endDate || null
  }
}

// Estado para almacenar los movimientos filtrados del componente hijo
const filteredExpenses = ref<Expense[]>([])

// Manejador para recibir los movimientos filtrados del componente hijo
const onExpensesUpdate = (expenses: Expense[]) => {
  filteredExpenses.value = expenses
}

// Verificar si hay filtros activos (search o dates)
const hasActiveFilters = computed(() => {
  return (
    currentFilter.value.search.trim() !== '' ||
    currentFilter.value.initDate !== null ||
    currentFilter.value.endDate !== null
  )
})

// Obtener movimientos del mes actual
const getExpensesOfCurrentMonth = (expenses: Expense[]): Expense[] => {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date)
    return (
      expenseDate.getMonth() === currentMonth &&
      expenseDate.getFullYear() === currentYear
    )
  })
}

// Gastos a considerar según los filtros
const expensesToConsider = computed(() => {
  // Si hay filtros activos, usar los movimientos filtrados del componente hijo
  if (hasActiveFilters.value) {
    return filteredExpenses.value
  }
  // Si no hay filtros, usar solo los del mes actual
  return getExpensesOfCurrentMonth(filteredExpenses.value)
})

// Calcular total de ingresos
const getTotalIngresos = computed(() => {
  const total = expensesToConsider.value.reduce((total, expense) => {
    if (expense.type === 'ingreso') {
      return total + expense.value
    }
    return total
  }, 0)

  return total && total > 0 ? currencyFormatter(total) : '$ 0'
})

// Calcular total de gastos
const getTotalGastos = computed(() => {
  const total = expensesToConsider.value.reduce((total, expense) => {
    if (expense.type === 'gasto') {
      return total + expense.value
    }
    return total
  }, 0)

  return total && total > 0 ? currencyFormatter(total) : '$ 0'
})

// Calcular total de movimientos (cantidad)
const getTotalMovimientos = computed(() => {
  return expensesToConsider.value.length
})
</script>

<style scoped lang="scss">
.account-preview {
  @media (min-width: 960px) {
    max-width: 960px;
    overflow: hidden;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 0 10px;

    @media (min-width: 960px) {
      max-width: 550px;
    }

    .subtitle {
      font-size: 0.9rem !important;
    }

    .more {
      font-size: 14px;
      font-family: $font-medium;
      color: $purple;
      padding-right: 15px;
    }
  }

  &__content {
    position: relative;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    padding-left: 15px;
    padding-top: 20px;
    height: calc(100dvh - 60px);
    padding-bottom: 90px;
  }

  &__expenses {
    overflow-y: auto;
    flex-grow: 1;
    height: calc(100dvh - 516px);
    padding-right: 15px;

    .expense-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid $border-general;
      padding-right: 10px;

      &__value {
        font-family: $font-medium;
      }

      &__description {
        color: $gray-text;
      }
    }
  }

  &__completed {
    margin-bottom: 10px;
    margin-top: 40px;

    &.not-pending {
      margin-top: 0;
    }

    span {
      font-size: 0.8rem;
      color: $text-light-gray;
    }

    i {
      font-size: 1.2rem;
      color: $text-light-gray;
    }
  }

  &__group {
    font-weight: 600;
    font-size: 0.9rem;
    margin: 20px 0 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    user-select: none;

    &:first-of-type {
      margin-top: 0;
    }

    .group-header-content {
      display: flex;
      align-items: center;
    }

    .group-chevron {
      font-size: 18px;
      transition: transform 0.2s ease;
    }

    .group-total {
      font-size: 0.85rem;
      font-weight: 700;
    }
  }

  &__body {
    @media (min-width: 960px) {
      max-width: 550px;
    }
  }

  &__summary {
    display: none;

    @media (min-width: 960px) {
      display: flex;
      position: absolute;
      right: 0;
      top: 200px;
      width: calc(100% - 560px);
      flex-direction: column;
      gap: 10px;
      align-items: center;
    }

    &-item {
      width: calc(100% - 10px);
      max-width: 250px;
      background-color: $white;
      border: 1px solid $border-general;
      color: $text-gray;
      padding: 17px 10px 10px 15px;
      border-radius: 16px;
      height: 90px;
      display: flex;
      flex-direction: column;
      text-align: center;

      p {
        font-size: 0.7rem;
        font-family: $font-medium;
      }
      .value {
        font-size: 1.4rem;
        color: $text-dark;
      }

      .ingreso {
        color: $color-green;
      }

      .gasto {
        color: $color-red;
      }
    }
  }
}

.pr15 {
  padding-right: 15px;
}
</style>
