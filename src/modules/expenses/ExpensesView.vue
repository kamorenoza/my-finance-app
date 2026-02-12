<template>
  <div class="expenses">
    <div class="general-header">
      <p class="general-title">Gastos del mes</p>
    </div>
    <div class="expenses__selector">
      <MonthYearSelector v-model="selectedDate" />
    </div>
    <div>
      <ExpensesFilter @filterChange="onFilterChange" />
      <div>
        <div
          v-for="(groupExpenses, groupName) in sortedAndGroupedExpenses"
          :key="groupName"
          class="expense-group"
        >
          <h3
            v-if="filterConfig.groupBy !== 'none' && filterConfig.groupBy"
            class="expense-group__title"
          >
            {{ groupName }}
          </h3>
          <div class="expense-group__items">
            <ExpenseItem
              v-for="expense in groupExpenses"
              :key="expense.id"
              :expense="expense"
              @edit="handleEditExpense"
              @updateAccount="handleUpdateExpenseAccount"
            />
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

const selectedDate = ref(new Date())
const expensesStore = useExpensesStore()
const search = ref('')
const selectedExpense = ref<Expense | null>(null)
const showEditDialog = ref(false)
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
}

.expense-group {
  margin-bottom: 20px;

  &__title {
    font-size: 16px;
    font-weight: 500;
    padding: 15px;
    margin: 0;
    background-color: $bg-general;
    border-radius: 8px;
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0 15px;
  }
}
</style>
