<template>
  <div class="expenses">
    <PageHeader title="Gastos del mes" />
    <div class="expenses__selector">
      <MonthYearSelector v-model="selectedDate" />
    </div>

    <!-- Total card - visible en mobile encima de filtros -->
    <div class="expenses__total-mobile">
      <ExpensesSummary :total="totalExpenses" />
    </div>

    <div class="expenses__content">
      <!-- Total card - visible en desktop a la izquierda -->
      <div class="expenses__total-desktop">
        <ExpensesSummary :total="totalExpenses" />
      </div>

      <!-- Lista de gastos a la derecha en desktop -->
      <ExpensesList
        :expenses="filteredBySearch"
        :groupedExpenses="sortedAndGroupedExpenses"
        :groupTotals="groupTotals"
        :groupBy="filterConfig.groupBy ?? null"
        @filterChange="onFilterChange"
        @edit="handleEditExpense"
        @updateAccount="handleUpdateExpenseAccount"
      >
        <template #addButton>
          <div class="expenses__add-btn" v-if="mdAndUp">
            <v-tooltip text="Agregar gasto" location="left">
              <template v-slot:activator="{ props }">
                <v-btn
                  :color="colorMdPrimary"
                  class="btn-fab fab-button"
                  @click="openAddExpenseDrawer"
                  v-bind="props"
                >
                  <AddIcon class="icon" />
                </v-btn>
              </template>
            </v-tooltip>
          </div>
        </template>
      </ExpensesList>
    </div>

    <AddExpense :selectedDate="selectedDate" />

    <EditExpense
      v-model="showEditDialog"
      :expense="selectedExpense"
      @save="handleSaveEditExpense"
      @delete="handleDeleteExpense"
    />

    <ExpensesDrawer ref="expensesDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useExpensesStore } from './expenses.store'
import { backupService } from '@/modules/shared/services/backup.service'
import dayjs from 'dayjs'
import type { Expense, AccountReference } from './expenses.interface'
import MonthYearSelector from '../shared/components/MonthYearSelector.vue'
import AddExpense from './components/AddExpense.vue'
import EditExpense from './components/EditExpense.vue'
import ExpensesSummary from './components/ExpensesSummary.vue'
import ExpensesList from './components/ExpensesList.vue'
import ExpensesDrawer from './components/ExpensesDrawer.vue'
import PageHeader from '../shared/components/PageHeader.vue'
import AddIcon from '@/assets/icons/Add.icon.vue'
import { colorMdPrimary } from '@/styles/variables.styles'

const { mdAndUp } = useDisplay()

const selectedDate = ref(new Date())
const expensesStore = useExpensesStore()
const search = ref('')
const selectedExpense = ref<Expense | null>(null)
const showEditDialog = ref(false)
const expensesDrawerRef = ref()
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
  if (mdAndUp.value) {
    // Open drawer on desktop
    if (expensesDrawerRef.value) {
      expensesDrawerRef.value.openEditDrawer(expense)
    }
  } else {
    // Open dialog on mobile
    selectedExpense.value = expense
    showEditDialog.value = true
  }
}

const openAddExpenseDrawer = () => {
  if (expensesDrawerRef.value) {
    expensesDrawerRef.value.openDrawer(selectedDate.value)
  }
}

const handleSaveEditExpense = (updatedExpense: Expense) => {
  expensesStore.updateExpense(updatedExpense)
}

const handleDeleteExpense = (expenseId: string) => {
  expensesStore.deleteExpense(expenseId)
}

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

    @media (min-width: 960px) {
      justify-content: start;
    }
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

  &__content {
    @media (min-width: 960px) {
      display: flex;
      gap: 10px;
    }
  }

  &__add-btn {
    .btn-fab {
      width: 40px !important;
      height: 40px !important;
      border-radius: 12px !important;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
