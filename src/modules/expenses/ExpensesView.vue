<template>
  <div class="expenses">
    <div class="general-header">
      <p class="general-title">Gastos del mes</p>
    </div>
    <div class="expenses__selector">
      <MonthYearSelector v-model="selectedDate" />
    </div>

    <!-- Total card - visible en mobile encima de filtros -->
    <div class="expenses__total-mobile">
      <v-card class="expenses__total-card">
        <v-card-text class="text-center">
          <div class="expenses__total-label">Total Gastos</div>
          <div class="expenses__total-amount">
            {{ currency(totalExpenses) }}
          </div>
        </v-card-text>
      </v-card>
    </div>

    <div class="expenses__content">
      <!-- Total card - visible en desktop a la izquierda -->
      <div class="expenses__total-desktop">
        <v-card class="bg-primary expenses__total-card">
          <v-card-text class="text-center">
            <div class="expenses__total-label">Total Gastos</div>
            <div class="expenses__total-amount">
              {{ currency(totalExpenses) }}
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Lista de gastos a la derecha en desktop -->
      <div class="expenses__list">
        <ExpensesFilter @filterChange="onFilterChange" />
        <EmptyState v-if="filteredBySearch.length === 0" />
        <div v-else class="expenses__list-content">
          <div
            v-for="(groupExpenses, groupName) in sortedAndGroupedExpenses"
            :key="groupName"
            class="expense-group"
          >
            <p
              v-if="filterConfig.groupBy !== 'none' && filterConfig.groupBy"
              class="expense-group__title"
              @click="toggleGroup(groupName)"
            >
              <span class="expense-group__title-content">
                <span>{{ formatGroupName(groupName) }}</span>
                <span class="expense-group__chevron">
                  <v-icon size="17">
                    {{
                      expandedGroups[groupName] === false
                        ? 'mdi-chevron-down'
                        : 'mdi-chevron-up'
                    }}
                  </v-icon>
                </span>
              </span>
              <span class="expense-group__total">{{
                currency(groupTotals[groupName] || 0)
              }}</span>
            </p>
            <transition name="slide">
              <div
                v-show="expandedGroups[groupName] !== false"
                class="expense-group__items"
              >
                <ExpenseItem
                  v-for="expense in groupExpenses"
                  :key="expense.id"
                  :expense="expense"
                  @edit="handleEditExpense"
                  @updateAccount="handleUpdateExpenseAccount"
                />
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>

    <AddExpense :selectedDate="selectedDate" />

    <EditExpense
      v-model="showEditDialog"
      :expense="selectedExpense"
      @save="handleSaveEditExpense"
      @delete="handleDeleteExpense"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useExpensesStore } from './expenses.store'
import { backupService } from '@/modules/shared/services/backup.service'
import dayjs from 'dayjs'
import type { Expense, AccountReference } from './expenses.interface'
import MonthYearSelector from '../shared/components/MonthYearSelector.vue'
import AddExpense from './components/AddExpense.vue'
import EditExpense from './components/EditExpense.vue'
import ExpensesFilter from './components/ExpensesFilter.vue'
import ExpenseItem from './components/ExpenseItem.vue'
import { dateFormatter } from '@/modules/shared/utils'
import EmptyState from '@/modules/shared/components/EmptyState.vue'

const selectedDate = ref(new Date())
const expensesStore = useExpensesStore()
const search = ref('')
const selectedExpense = ref<Expense | null>(null)
const showEditDialog = ref(false)
const expandedGroups = ref<Record<string, boolean>>({})
const filterConfig = ref({
  groupBy: expensesStore.filterConfig.groupBy,
  orderBy: expensesStore.filterConfig.orderBy
})

// Filtrar por mes seleccionado
const expensesByMonth = computed(() => {
  const month = dayjs(selectedDate.value).startOf('month')
  const monthEnd = dayjs(selectedDate.value).endOf('month')

  return expensesStore.expenses.filter(expense => {
    const expenseDate = dayjs(expense.date)
    return (
      (expenseDate.isAfter(month) && expenseDate.isBefore(monthEnd)) ||
      expenseDate.isSame(month, 'day') ||
      expenseDate.isSame(monthEnd, 'day')
    )
  })
})

// Filtrar por búsqueda
const filteredBySearch = computed(() => {
  if (!search.value.trim()) return expensesByMonth.value
  const keyword = search.value.toLowerCase()
  return expensesByMonth.value.filter(exp =>
    exp.name.toLowerCase().includes(keyword)
  )
})

// Agrupar gastos
const groupedExpenses = computed(() => {
  const groupBy = filterConfig.value.groupBy

  if (groupBy === 'none' || !groupBy) {
    return { all: filteredBySearch.value }
  }

  if (groupBy === 'account') {
    return filteredBySearch.value.reduce(
      (acc, expense) => {
        const key = expense.account?.name || 'Presupuesto'
        if (!acc[key]) acc[key] = []
        acc[key].push(expense)
        return acc
      },
      {} as Record<string, Expense[]>
    )
  }

  if (groupBy === 'date') {
    return filteredBySearch.value.reduce(
      (acc, expense) => {
        const key = dayjs(expense.date).format('DD/MM/YYYY')
        if (!acc[key]) acc[key] = []
        acc[key].push(expense)
        return acc
      },
      {} as Record<string, Expense[]>
    )
  }

  return { all: filteredBySearch.value }
})

// Ordenar gastos
const sortedAndGroupedExpenses = computed(() => {
  const orderBy = filterConfig.value.orderBy
  const sorted: Record<string, Expense[]> = {}

  Object.entries(groupedExpenses.value).forEach(([key, expenses]) => {
    let sortedList = [...expenses]

    if (orderBy === 'newest') {
      sortedList.sort(
        (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
      )
    } else if (orderBy === 'oldest') {
      sortedList.sort(
        (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
      )
    } else if (orderBy === 'highest') {
      sortedList.sort((a, b) => b.value - a.value)
    } else if (orderBy === 'lowest') {
      sortedList.sort((a, b) => a.value - b.value)
    }

    sorted[key] = sortedList
  })

  return sorted
})

// Calcular total de gastos filtrados
const totalExpenses = computed(() => {
  return filteredBySearch.value.reduce((sum, expense) => sum + expense.value, 0)
})

// Calcular total por grupo
const groupTotals = computed(() => {
  const totals: Record<string, number> = {}
  Object.entries(sortedAndGroupedExpenses.value).forEach(([key, expenses]) => {
    totals[key] = expenses.reduce((sum, expense) => sum + expense.value, 0)
  })
  return totals
})

// Formatear nombre del grupo (para fechas)
const formatGroupName = (groupName: string) => {
  if (filterConfig.value.groupBy === 'date') {
    // groupName está en formato 'DD/MM/YYYY', convertir a Date y formatear
    const [day, month, year] = groupName.split('/')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return dateFormatter(date)
  }
  return groupName
}

// Toggle grupo expandido/colapsado
const toggleGroup = (groupName: string) => {
  expandedGroups.value[groupName] = !expandedGroups.value[groupName]
}

const onFilterChange = (filter: {
  search: string
  groupBy: string | null
  orderBy: string | null
}) => {
  search.value = filter.search
  filterConfig.value = {
    groupBy: filter.groupBy,
    orderBy: filter.orderBy
  }
}

const handleUpdateExpenseAccount = (
  expenseId: string,
  account: AccountReference | null
) => {
  expensesStore.updateExpenseAccount(expenseId, account)
}

const handleEditExpense = (expense: Expense) => {
  selectedExpense.value = expense
  showEditDialog.value = true
}

const handleSaveEditExpense = (updatedExpense: Expense) => {
  expensesStore.updateExpense(updatedExpense)
}

const handleDeleteExpense = (expenseId: string) => {
  expensesStore.deleteExpense(expenseId)
}

const currency = (value: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value)

// Watch filterConfig changes to update backup
watch(
  () => filterConfig.value,
  () => {
    backupService.queueBackup()
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
.expenses {
  padding-left: 0;
  position: relative;
  height: calc(100vh - 95px);

  @media (min-width: 960px) {
    padding-left: 20px;
  }

  &__selector {
    display: flex;
    align-items: center;
    gap: 15px;
    justify-content: center;
  }

  &__total-mobile {
    display: block;
    padding: 4px;
    padding-bottom: 0;
    margin: 10px 14px 0;

    @media (min-width: 960px) {
      display: none;
    }
  }

  &__total-desktop {
    display: none;

    @media (min-width: 960px) {
      display: block;
      width: 250px;
      flex-shrink: 0;
      margin-top: 20px;
    }
  }

  &__total-card {
    border-radius: 18px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background: $blue !important;
  }

  &__total-label {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    letter-spacing: 0.5px;
  }

  &__total-amount {
    font-size: 22px;
    font-family: $font-medium;
    color: white;
    padding-right: 10px;
  }

  &__content {
    @media (min-width: 960px) {
      display: flex;
      gap: 20px;
    }
  }

  &__list {
    flex: 1;

    &-content {
      height: calc(100vh - 450px);
      overflow-y: scroll;
      padding-bottom: 50px;
    }
  }
}

.expense-group {
  margin-bottom: 20px;

  &__title {
    font-size: 0.95rem;
    font-family: $font-medium;
    padding: 10px 15px;
    margin: 0;
    margin-bottom: 5px;
    border-radius: 12px;
    color: #333;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &-content {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }
  }

  &__chevron {
    display: flex;
    align-items: center;
    transition: transform 0.2s ease;
    background-color: $bg-general;
    border-radius: 100%;
    margin-left: 3px;
    width: 20px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__total {
    font-weight: 600;
    font-size: 0.95rem;
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0 15px;
  }
}

.slide-enter-active,
.slide-leave-active {
  transition:
    max-height 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 5000px;
  overflow: hidden;
  will-change: max-height, opacity;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
