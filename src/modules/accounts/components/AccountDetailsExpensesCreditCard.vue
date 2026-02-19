<template>
  <div class="account-preview__expenses">
    <EmptyState v-if="pendingExpenses.length === 0" />
    <template v-else>
      <template v-for="group in getPendingExpensesGrouped" :key="group.label">
        <p
          v-if="!group.hideHeader"
          class="account-preview__group"
          @click="toggleGroup(group.label)"
          :style="{
            borderLeftColor:
              group.expenses[0]?.category?.backgroundColor || '#9e9e9e'
          }"
        >
          <span class="group-header-content">
            <span>{{ group.label }}</span>
            <span class="account-preview__chevron">
              <v-icon size="17">
                {{
                  expandedGroups[group.label] === false
                    ? 'mdi-chevron-down'
                    : 'mdi-chevron-up'
                }}
              </v-icon>
            </span>
          </span>
          <span
            v-currency-formatter="Math.abs(group.total)"
            class="group-total"
          ></span>
        </p>
        <transition name="slide">
          <div
            v-show="expandedGroups[group.label] !== false || group.hideHeader"
            class="account-preview__group-content"
          >
            <AccountExpense
              v-for="expense in group.expenses"
              :key="expense.id"
              :expense="expense"
              :account-id="accountId"
            />
          </div>
        </transition>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AccountExpense from './AccountExpense.vue'
import { useAccountsStore } from '../accounts.store'
import type { Expense } from '../accounts.interface'
import { dateFormatter } from '@/modules/shared/utils'
import { configService } from '@/modules/shared/services/config.service'
import EmptyState from '@/modules/shared/components/EmptyState.vue'

const props = defineProps<{
  accountId: string
  filters: {
    search: string
    groupBy: string | null
    orderBy: string | null
    initDate?: Date | null
    endDate?: Date | null
    collapseAll?: boolean
  }
}>()

const emit = defineEmits<{
  updateExpenses: [expenses: Expense[]]
}>()

const store = useAccountsStore()

const accountId = props.accountId
const expandedGroups = ref<{ [key: string]: boolean }>({})
const showCompleted = ref(false)

onMounted(() => {
  const savedConfig = configService.getAccountConfig(accountId)
  const savedExpandedGroups = savedConfig.expandedGroups || {}
  const defaultExpanded = !props.filters.collapseAll

  getPendingExpensesGrouped.value.forEach((group: any) => {
    expandedGroups.value[group.label] =
      savedExpandedGroups[group.label] !== undefined
        ? savedExpandedGroups[group.label]
        : defaultExpanded
  })

  showCompleted.value = getPendingExpensesGrouped.value.length === 0
  emit('updateExpenses', pendingExpenses.value)
})

const pendingExpenses = computed(
  () => store.getAccountById(accountId)?.expenses || []
)

const toggleGroup = (groupLabel: string) => {
  if (expandedGroups.value[groupLabel] === undefined) {
    expandedGroups.value[groupLabel] = false
  } else {
    expandedGroups.value[groupLabel] = !expandedGroups.value[groupLabel]
  }

  // Guardar el estado
  saveExpandedGroups()
}

const saveExpandedGroups = () => {
  const currentConfig = configService.getAccountConfig(accountId)
  configService.saveAccountConfig(accountId, {
    ...currentConfig,
    expandedGroups: { ...expandedGroups.value }
  })
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

  // Aplicar filtro de fechas
  if (props.filters.initDate || props.filters.endDate) {
    filtered = filtered.filter(expense => {
      const expenseDate = new Date(expense.date)
      const expenseDateOnly = new Date(
        expenseDate.getFullYear(),
        expenseDate.getMonth(),
        expenseDate.getDate()
      )

      // Si ambas fechas están presentes, filtrar por rango
      if (props.filters.initDate && props.filters.endDate) {
        const initDateOnly = new Date(
          props.filters.initDate.getFullYear(),
          props.filters.initDate.getMonth(),
          props.filters.initDate.getDate()
        )
        const endDateOnly = new Date(
          props.filters.endDate.getFullYear(),
          props.filters.endDate.getMonth(),
          props.filters.endDate.getDate()
        )
        return expenseDateOnly >= initDateOnly && expenseDateOnly <= endDateOnly
      }

      // Si solo initDate está presente
      if (props.filters.initDate) {
        const initDateOnly = new Date(
          props.filters.initDate.getFullYear(),
          props.filters.initDate.getMonth(),
          props.filters.initDate.getDate()
        )
        return expenseDateOnly.getTime() === initDateOnly.getTime()
      }

      // Si solo endDate está presente
      if (props.filters.endDate) {
        const endDateOnly = new Date(
          props.filters.endDate.getFullYear(),
          props.filters.endDate.getMonth(),
          props.filters.endDate.getDate()
        )
        return expenseDateOnly.getTime() === endDateOnly.getTime()
      }

      return true
    })
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

// Watchers para emitir cambios
watch(
  () => applyFilters(pendingExpenses.value),
  newExpenses => {
    emit('updateExpenses', newExpenses)
  },
  { deep: true }
)

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

  // Si es "none", agrupar internamente por categoría pero sin mostrar headers
  if (props.filters.groupBy === 'none') {
    const sorted = filtered.sort((a, b) =>
      (a.category?.name || 'Sin categoría').localeCompare(
        b.category?.name || 'Sin categoría'
      )
    )
    return [
      {
        type: 'group',
        label: 'All',
        total: sorted.reduce(
          (sum, e) => (e.type === 'ingreso' ? sum + e.value : sum - e.value),
          0
        ),
        expenses: sorted,
        hideHeader: true
      }
    ] as any
  }

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

// Watcher para manejar collapseAll — solo se dispara cuando el usuario
// cambia el toggle activamente (no en el mount inicial)
watch(
  () => props.filters.collapseAll,
  collapseAll => {
    const isExpanded = !collapseAll
    getPendingExpensesGrouped.value.forEach((group: any) => {
      expandedGroups.value[group.label] = isExpanded
    })
    saveExpandedGroups()
  }
)

// Watcher para grupos nuevos que aparezcan después del mount. Sin immediate.
watch(getPendingExpensesGrouped, groups => {
  const defaultExpanded = !props.filters.collapseAll
  groups.forEach((group: any) => {
    if (expandedGroups.value[group.label] === undefined) {
      expandedGroups.value[group.label] = defaultExpanded
    }
  })
})
</script>

<style scoped lang="scss">
.account-preview {
  &__expenses {
    overflow-y: auto;
    flex-grow: 1;
    height: calc(100dvh - 360px);
    padding-right: 15px;
    padding-bottom: 60px;

    @media (min-width: 960px) {
      height: calc(100dvh - 230px);
      padding-right: 25px;
    }

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
    margin-top: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;

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
    margin-bottom: 15px;
    margin-top: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    user-select: none;
    //border-bottom: 1px solid $bg-general;
    padding-bottom: 5px;
    padding: 10px;
    background-color: $bg-input;
    border-radius: 8px;
    border-left: 4px solid;

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
      font-size: 0.9rem;
      font-weight: 100;
      font-family: $font-medium;
    }
  }

  &__group-content {
    padding-bottom: 20px;
  }

  &__chevron {
    background-color: $bg-general;
    border-radius: 100%;
    margin-left: 3px;
    width: 20px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}

.pr15 {
  padding-right: 15px;
}

.slide-enter-active,
.slide-leave-active {
  transition:
    max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
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
