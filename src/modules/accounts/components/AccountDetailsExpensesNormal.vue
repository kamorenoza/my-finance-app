<template>
  <div class="account-preview__expenses">
    <template v-for="group in getPendingExpensesGrouped" :key="group.label">
      <p class="account-preview__group" @click="toggleGroup(group.label)">
        <span class="group-header-content">
          {{ group.label }}
          <v-icon v-if="expandedGroups[group.label] === false">
            mdi-chevron-down
          </v-icon>
        </span>
        <span
          v-currency-formatter="Math.abs(group.total)"
          class="group-total"
        ></span>
      </p>
      <transition name="slide">
        <div v-show="expandedGroups[group.label] !== false">
          <AccountExpense
            v-for="expense in group.expenses"
            :key="expense.id"
            :expense="expense"
            :account-id="accountId"
          />
        </div>
      </transition>
    </template>

    <div v-if="getCompletedExpensesGrouped.length > 0">
      <div
        class="account-preview__completed"
        @click="showCompleted = !showCompleted"
        :class="{ 'not-pending': getPendingExpensesGrouped.length === 0 }"
      >
        <span>Movimientos Completados</span>
        <v-icon>{{
          showCompleted ? 'mdi-chevron-up' : 'mdi-chevron-down'
        }}</v-icon>
      </div>
      <transition name="slide">
        <div v-show="showCompleted" class="completed-expenses">
          <template
            v-for="group in getCompletedExpensesGrouped"
            :key="group.label"
          >
            <p class="account-preview__group" @click="toggleGroup(group.label)">
              <span class="group-header-content">
                {{ group.label }}
                <v-icon v-if="expandedGroups[group.label] === false">
                  mdi-chevron-down
                </v-icon>
              </span>
              <span
                v-currency-formatter="Math.abs(group.total)"
                class="group-total"
              ></span>
            </p>
            <transition name="slide">
              <div v-show="expandedGroups[group.label] !== false">
                <AccountExpense
                  v-for="expense in group.expenses"
                  :key="expense.id"
                  :expense="expense"
                  :account-id="accountId"
                />
              </div>
            </transition>
          </template>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AccountExpense from './AccountExpense.vue'
import { useAccountsStore } from '../accounts.store'
import type { Expense } from '../accounts.interface'
import { dateFormatter } from '@/modules/shared/utils'

const props = defineProps<{
  accountId: string
  filters: {
    search: string
    groupBy: string | null
    orderBy: string | null
  }
}>()

const store = useAccountsStore()

const accountId = props.accountId
const expandedGroups = ref<{ [key: string]: boolean }>({})
const showCompleted = ref(false)

onMounted(() => {
  showCompleted.value = getPendingExpensesGrouped.value.length === 0
})

const pendingExpenses = computed(() =>
  (store.getAccountById(accountId)?.expenses || []).filter(e => e.isPending)
)

const completedExpenses = computed(() =>
  (store.getAccountById(accountId)?.expenses || []).filter(e => !e.isPending)
)

const toggleGroup = (groupLabel: string) => {
  if (expandedGroups.value[groupLabel] === undefined) {
    expandedGroups.value[groupLabel] = false
  } else {
    expandedGroups.value[groupLabel] = !expandedGroups.value[groupLabel]
  }
}

const applyFilters = (expenses: Expense[]) => {
  let filtered = [...expenses]

  // Aplicar búsqueda
  if (props.filters.search) {
    const searchLower = props.filters.search.toLowerCase()
    filtered = filtered.filter(
      e =>
        e.description.toLowerCase().includes(searchLower) ||
        e.category?.name?.toLowerCase().includes(searchLower)
    )
  }

  // Aplicar ordenamiento
  if (props.filters.orderBy) {
    switch (props.filters.orderBy) {
      case 'newest':
        filtered.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        break
      case 'oldest':
        filtered.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
        break
      case 'highest':
        filtered.sort((a, b) => b.value - a.value)
        break
      case 'lowest':
        filtered.sort((a, b) => a.value - b.value)
        break
    }
  }

  return filtered
}

const addGroupHeaders = (expenses: Expense[]) => {
  const result: {
    type: 'group'
    label: string
    total: number
    expenses: Expense[]
  }[] = []
  let currentGroup: string | null = null
  let groupExpenses: Expense[] = []

  const calculateGroupTotal = (exps: Expense[]): number => {
    return exps.reduce((sum, exp) => {
      if (exp.type === 'ingreso') {
        return sum + exp.value
      } else {
        return sum - exp.value
      }
    }, 0)
  }

  expenses.forEach(expense => {
    let groupKey: string | null = null

    if (props.filters.groupBy === 'category') {
      groupKey = expense.category?.name || 'Sin categoría'
    } else if (props.filters.groupBy === 'type') {
      groupKey = expense.type === 'ingreso' ? 'Ingresos' : 'Gastos'
    } else if (props.filters.groupBy === 'date') {
      groupKey = dateFormatter(expense.date)
    }

    if (groupKey && groupKey !== currentGroup) {
      // Si hay grupo anterior, guardarlo
      if (currentGroup !== null && groupExpenses.length > 0) {
        const total = calculateGroupTotal(groupExpenses)
        result.push({
          type: 'group',
          label: currentGroup,
          total,
          expenses: groupExpenses
        })
      }
      currentGroup = groupKey
      groupExpenses = []
    }

    groupExpenses.push(expense)
  })

  // Guardar el último grupo
  if (currentGroup !== null && groupExpenses.length > 0) {
    const total = calculateGroupTotal(groupExpenses)
    result.push({
      type: 'group',
      label: currentGroup,
      total,
      expenses: groupExpenses
    })
  }

  return result
}

const getPendingExpensesGrouped = computed(() => {
  const filtered = applyFilters(pendingExpenses.value)

  if (!props.filters.groupBy) {
    return [
      {
        type: 'group',
        label: 'All',
        total: filtered.reduce(
          (sum, e) => (e.type === 'ingreso' ? sum + e.value : sum - e.value),
          0
        ),
        expenses: filtered
      }
    ] as any
  }

  if (props.filters.groupBy === 'category') {
    const sorted = filtered.sort((a, b) =>
      (a.category?.name || 'Sin categoría').localeCompare(
        b.category?.name || 'Sin categoría'
      )
    )
    return addGroupHeaders(sorted)
  }

  if (props.filters.groupBy === 'type') {
    const sorted = filtered.sort((a, b) => a.type.localeCompare(b.type))
    return addGroupHeaders(sorted)
  }

  if (props.filters.groupBy === 'date') {
    const sorted = filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    return addGroupHeaders(sorted)
  }

  return [
    {
      type: 'group',
      label: 'All',
      total: filtered.reduce(
        (sum, e) => (e.type === 'ingreso' ? sum + e.value : sum - e.value),
        0
      ),
      expenses: filtered
    }
  ] as any
})

const getCompletedExpensesGrouped = computed(() => {
  const filtered = applyFilters(completedExpenses.value)

  if (!props.filters.groupBy) {
    return [
      {
        type: 'group',
        label: 'All',
        total: filtered.reduce(
          (sum, e) => (e.type === 'ingreso' ? sum + e.value : sum - e.value),
          0
        ),
        expenses: filtered
      }
    ] as any
  }

  if (props.filters.groupBy === 'category') {
    const sorted = filtered.sort((a, b) =>
      (a.category?.name || 'Sin categoría').localeCompare(
        b.category?.name || 'Sin categoría'
      )
    )
    return addGroupHeaders(sorted)
  }

  if (props.filters.groupBy === 'type') {
    const sorted = filtered.sort((a, b) => a.type.localeCompare(b.type))
    return addGroupHeaders(sorted)
  }

  if (props.filters.groupBy === 'date') {
    const sorted = filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    return addGroupHeaders(sorted)
  }

  return [
    {
      type: 'group',
      label: 'All',
      total: filtered.reduce(
        (sum, e) => (e.type === 'ingreso' ? sum + e.value : sum - e.value),
        0
      ),
      expenses: filtered
    }
  ] as any
})
</script>

<style scoped lang="scss">
.account-preview {
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
}

.pr15 {
  padding-right: 15px;
}
</style>
