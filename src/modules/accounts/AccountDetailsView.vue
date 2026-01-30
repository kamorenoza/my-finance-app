<template>
  <div class="account-preview">
    <div>
      <v-btn
        class="account-preview__back"
        @click="backToAccounts"
        :ripple="false"
      >
        <v-icon left>mdi-arrow-left</v-icon>
      </v-btn>
    </div>
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
        <div class="account-preview__pie">
          <Pie :data="chartData" :options="options" />
        </div>

        <div class="account-preview__history">
          <h3>Histórico últimos 6 meses</h3>
          <table class="history-table">
            <thead>
              <tr>
                <th>Mes</th>
                <th class="ingreso">Ingresos</th>
                <th class="gasto">Gastos</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="month in getSixMonthsHistory"
                :key="`${month.year}-${month.month}`"
              >
                <td>{{ month.monthYear }}</td>
                <td class="ingreso">
                  {{
                    month.ingresos > 0
                      ? currencyFormatter(month.ingresos)
                      : '$ 0'
                  }}
                </td>
                <td class="gasto">
                  {{
                    month.gastos > 0 ? currencyFormatter(month.gastos) : '$ 0'
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!--<div class="account-preview__summary-item ingreso">
          <p>
            Total ingresos
            <span v-if="!hasActiveFilters">del mes</span>
          </p>
          <p class="value">{{ getTotalIngresos }}</p>
        </div>

        <div class="account-preview__summary-item gasto">
          <p>Total gastos <span v-if="!hasActiveFilters">del mes</span></p>
          <p class="value">{{ getTotalGastos }}</p>
        </div>

        <div class="account-preview__summary-item">
          <p>Total movimientos <span v-if="!hasActiveFilters">del mes</span></p>
          <p class="value">{{ getTotalMovimientos }}</p>
        </div>-->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAccountsStore } from '@/modules/accounts/accounts.store'
import { configService } from '@/modules/accounts/config.service'
import type { Expense } from '@/modules/accounts/accounts.interface'
import NormalCard from './components/NormalCard.vue'
import AccountDetailsFilter from './components/AccountDetailsFilter.vue'
import AccountDetailsExpensesNormal from './components/AccountDetailsExpensesNormal.vue'
import AccountDetailsExpensesCreditCard from './components/AccountDetailsExpensesCreditCard.vue'
import CardCreditCard from './components/CardCreditCard.vue'
import { currencyFormatter } from '../shared/utils'
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const route = useRoute()
const store = useAccountsStore()
const router = useRouter()

const accountId = route.params.id as string
const account = computed(() => store.getAccountById(accountId)!)

const currentFilter = ref({
  search: '',
  groupBy: account.value.type === 'TC' ? 'none' : ('category' as string | null),
  orderBy: null as string | null,
  initDate: null as Date | null,
  endDate: null as Date | null
})

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const
    }
  }
}

// Agrupar gastos por categoría y calcular totales
const expensesByCategory = computed(() => {
  const categories: {
    [key: string]: { total: number; color: string }
  } = {}

  expensesToConsider.value.forEach(expense => {
    const categoryName = expense.category?.name || 'Sin categoría'

    if (!categories[categoryName]) {
      // Tomar el color de la primera categoría encontrada
      categories[categoryName] = {
        total: 0,
        color: expense.category?.backgroundColor || '#999999'
      }
    }

    // Solo sumar gastos (no ingresos)
    if (expense.type === 'gasto') {
      categories[categoryName].total += expense.value
    }
  })

  return categories
})

// Generar datos dinámicos para la gráfica
const chartData = computed(() => {
  const labels = Object.keys(expensesByCategory.value)
  const data = Object.values(expensesByCategory.value).map(cat => cat.total)
  const backgroundColor = Object.values(expensesByCategory.value).map(
    cat => cat.color
  )

  return {
    labels,
    datasets: [
      {
        backgroundColor,
        data,
        borderColor: '#ffffff',
        borderWidth: 2
      }
    ]
  }
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

const backToAccounts = (event: Event) => {
  event.stopPropagation()
  router.push({ name: 'cuentas' })
}

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

// Obtener histórico de los últimos 6 meses
const getSixMonthsHistory = computed(() => {
  if (!account.value || !account.value.expenses) {
    return []
  }

  const history: {
    monthYear: string
    month: number
    year: number
    ingresos: number
    gastos: number
  }[] = []

  // Obtener los últimos 6 meses
  const today = new Date()
  for (let i = 5; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const month = date.getMonth()
    const year = date.getFullYear()

    const monthName = new Intl.DateTimeFormat('es-ES', {
      month: 'short',
      year: 'numeric'
    }).format(date)

    // Calcular ingresos y gastos del mes usando todos los gastos sin filtros
    const allExpenses = account.value.expenses || []

    let ingresos = 0
    let gastos = 0

    allExpenses.forEach(expense => {
      const expenseDate = new Date(expense.date)
      if (
        expenseDate.getMonth() === month &&
        expenseDate.getFullYear() === year
      ) {
        if (expense.type === 'ingreso') {
          ingresos += expense.value
        } else {
          gastos += expense.value
        }
      }
    })

    history.push({
      monthYear: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      month,
      year,
      ingresos,
      gastos
    })
  }

  return history.reverse()
})
</script>

<style scoped lang="scss">
.account-preview {
  position: relative;

  @media (min-width: 960px) {
    max-width: 960px;
    overflow: hidden;
  }

  &__back {
    background: none;
    border: none;
    box-shadow: none;
    position: absolute;
    top: 0;
    z-index: 9;
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
    padding-top: 40px;
    height: calc(100dvh - 60px);
    padding-bottom: 10px;
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
    flex-direction: column;
    gap: 15px;
    align-items: center;
    width: 100%;
    height: calc(100dvh - 100px);

    @media (min-width: 960px) {
      display: flex;
      position: absolute;
      right: 0;
      top: 20px;
      width: calc(100% - 560px);
      overflow-y: auto;
      max-height: calc(100dvh - 100px);
    }

    &-item {
      width: calc(100% - 10px);
      max-width: 200px;
      background-color: $white;
      color: $text-gray;
      padding: 10px;
      padding-left: 15px;
      border-radius: 16px;
      height: 80px;
      display: flex;
      flex-direction: column;
      border: 1px solid $border-general;
      border-top: 4px solid #8971ad;

      p {
        font-size: 0.7rem;
        font-family: $font-medium;
      }
      .value {
        font-size: 1.4rem;
        color: $text-dark;
      }

      &.ingreso {
        border-top: 4px solid $color-green;
        .value {
          color: $color-green;
        }
      }

      &.gasto {
        border-top: 4px solid $color-red;
        .value {
          color: $color-red;
        }
      }
    }
  }

  &__history {
    width: 80%;
    max-width: 400px;
    background-color: #ece9ef;
    border-radius: 16px;
    padding: 15px;
    margin-top: 14px;

    h3 {
      font-size: 0.9rem;
      margin: 0 0 10px 0;
      color: $text-dark;
    }

    .history-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.8rem;

      thead {
        tr {
          border-bottom: 2px solid $border-general;

          th {
            padding: 8px 5px;
            text-align: left;
            color: $text-dark;

            &.ingreso {
              color: $color-green;
              text-align: right;
            }

            &.gasto {
              color: $color-red;
              text-align: right;
            }
          }
        }
      }

      tbody {
        tr {
          border-bottom: 1px solid $border-general;

          &:hover {
            background-color: #f9f9f9;
          }

          td {
            padding: 10px 5px;
            color: $text-gray;

            &.ingreso {
              color: $color-green;
              font-family: $font-medium;
              text-align: right;
            }

            &.gasto {
              color: $color-red;
              font-family: $font-medium;
              text-align: right;
            }

            &:first-child {
              text-align: left;
              color: $text-dark;
            }
          }
        }
      }
    }
  }

  &__pie {
    height: 170px;
  }
}

.pr15 {
  padding-right: 15px;
}
</style>
