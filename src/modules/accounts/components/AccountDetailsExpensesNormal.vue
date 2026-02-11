<template>
  <div class="account-preview__expenses">
    <div v-if="allFilteredExpenses.length === 0" class="empty-state">
      <p>No hay movimientos para mostrar</p>
    </div>
    <template v-else>
      <template v-for="group in getPendingExpensesGrouped" :key="group.label">
        <p
          v-if="!group.hideHeader"
          class="account-preview__group"
          @click="toggleGroup('pending', group.label)"
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
                  expandedPendingGroups[group.label] === false
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
            v-show="
              expandedPendingGroups[group.label] !== false || group.hideHeader
            "
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

      <div v-if="getCompletedExpensesGrouped.length > 0">
        <div
          class="account-preview__completed"
          @click="showCompleted = !showCompleted"
          :class="{
            'not-pending': pendingExpenses.length === 0
          }"
          v-if="pendingExpenses.length > 0"
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
              <p
                v-if="!group.hideHeader && pendingExpenses.length === 0"
                class="account-preview__group"
                @click="toggleGroup('completed', group.label)"
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
                        expandedCompletedGroups[group.label] === false
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
                  v-show="
                    expandedCompletedGroups[group.label] !== false ||
                    group.hideHeader ||
                    pendingExpenses.length > 0
                  "
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
          </div>
        </transition>
      </div>
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

interface ExpenseGroup {
  label: string
  total: number
  expenses: Expense[]
  hideHeader?: boolean
}

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
const expandedPendingGroups = ref<{ [key: string]: boolean }>({})
const expandedCompletedGroups = ref<{ [key: string]: boolean }>({})
const showCompleted = ref(false)
const hasLoadedState = ref(false)

onMounted(() => {
  // Cargar estado guardado de grupos expandidos
  const savedConfig = configService.getAccountConfig(accountId)
  if (
    savedConfig.expandedGroups &&
    Object.keys(savedConfig.expandedGroups).length > 0
  ) {
    expandedPendingGroups.value = { ...savedConfig.expandedGroups }
    expandedCompletedGroups.value = { ...savedConfig.expandedGroups }
    hasLoadedState.value = true
  }

  showCompleted.value = getPendingExpensesGrouped.value.length === 0
  emit('updateExpenses', allFilteredExpenses.value)
})

const pendingExpenses = computed(() =>
  (store.getAccountById(accountId)?.expenses || []).filter(e => e.isPending)
)

const completedExpenses = computed(() =>
  (store.getAccountById(accountId)?.expenses || []).filter(e => !e.isPending)
)

const toggleGroup = (section: 'pending' | 'completed', groupLabel: string) => {
  const groups =
    section === 'pending' ? expandedPendingGroups : expandedCompletedGroups
  groups.value[groupLabel] =
    groups.value[groupLabel] === undefined ? false : !groups.value[groupLabel]

  // Guardar el estado
  saveExpandedGroups()
}

const saveExpandedGroups = () => {
  const currentConfig = configService.getAccountConfig(accountId)
  // Combinar ambos estados (pending y completed) en uno solo
  const combinedGroups = {
    ...expandedPendingGroups.value,
    ...expandedCompletedGroups.value
  }
  configService.saveAccountConfig(accountId, {
    ...currentConfig,
    expandedGroups: combinedGroups
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

  // Aplicar ordenamiento (por defecto: más reciente a más antiguo)
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
  } else {
    filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
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

// Computed para obtener todos los movimientos filtrados (pendientes + completados)
const allFilteredExpenses = computed(() => {
  const pendingFiltered = applyFilters(pendingExpenses.value)
  const completedFiltered = applyFilters(completedExpenses.value)
  return [...pendingFiltered, ...completedFiltered]
})

// Watchers para emitir cambios
watch(
  () => allFilteredExpenses.value,
  newExpenses => {
    emit('updateExpenses', newExpenses)
  },
  { deep: true }
)

const getPendingExpensesGrouped = computed((): ExpenseGroup[] => {
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
        label: 'All',
        total: sorted.reduce(
          (sum, e) => (e.type === 'ingreso' ? sum + e.value : sum - e.value),
          0
        ),
        expenses: sorted,
        hideHeader: true
      }
    ]
  }

  if (!props.filters.groupBy) {
    return [
      {
        label: 'All',
        total: filtered.reduce(
          (sum, e) => (e.type === 'ingreso' ? sum + e.value : sum - e.value),
          0
        ),
        expenses: filtered
      }
    ]
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
    const sorted = filtered.sort((a, b) => {
      if (props.filters.orderBy === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
      if (props.filters.orderBy === 'oldest') {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      }

      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
    return addGroupHeaders(sorted)
  }

  return [
    {
      label: 'All',
      total: filtered.reduce(
        (sum, e) => (e.type === 'ingreso' ? sum + e.value : sum - e.value),
        0
      ),
      expenses: filtered
    }
  ]
})

const getCompletedExpensesGrouped = computed((): ExpenseGroup[] => {
  const filtered = applyFilters(completedExpenses.value)

  if (filtered.length === 0) {
    return []
  }

  // Si es "none", agrupar internamente por categoría pero sin mostrar headers
  if (props.filters.groupBy === 'none') {
    const sorted = filtered.sort((a, b) =>
      (a.category?.name || 'Sin categoría').localeCompare(
        b.category?.name || 'Sin categoría'
      )
    )
    return [
      {
        label: 'All',
        total: sorted.reduce(
          (sum, e) => (e.type === 'ingreso' ? sum + e.value : sum - e.value),
          0
        ),
        expenses: sorted,
        hideHeader: true
      }
    ]
  }

  if (!props.filters.groupBy) {
    return [
      {
        label: 'All',
        total: filtered.reduce(
          (sum, e) => (e.type === 'ingreso' ? sum + e.value : sum - e.value),
          0
        ),
        expenses: filtered
      }
    ]
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
    const sorted = filtered.sort((a, b) => {
      if (props.filters.orderBy === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
      if (props.filters.orderBy === 'oldest') {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      }

      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
    return addGroupHeaders(sorted)
  }

  return [
    {
      label: 'All',
      total: filtered.reduce(
        (sum, e) => (e.type === 'ingreso' ? sum + e.value : sum - e.value),
        0
      ),
      expenses: filtered
    }
  ]
})

// Watcher para manejar collapseAll
watch(
  () => props.filters.collapseAll,
  (collapseAll, oldValue) => {
    // Solo ejecutar si hay un cambio real (no undefined -> true al montar)
    if (collapseAll && oldValue !== undefined) {
      // Colapsar todos los grupos
      getPendingExpensesGrouped.value.forEach(group => {
        expandedPendingGroups.value[group.label] = false
      })
      getCompletedExpensesGrouped.value.forEach(group => {
        expandedCompletedGroups.value[group.label] = false
      })
      saveExpandedGroups()
    }
  }
)

// Watcher en getPendingExpensesGrouped para aplicar collapseAll SOLO si no hay estado guardado
watch(
  getPendingExpensesGrouped,
  groups => {
    // Solo aplicar collapseAll si no se ha cargado estado previo
    if (props.filters.collapseAll && !hasLoadedState.value) {
      groups.forEach(group => {
        expandedPendingGroups.value[group.label] = false
      })
      saveExpandedGroups()
    }
  },
  { immediate: true }
)

// Watcher en getCompletedExpensesGrouped para aplicar collapseAll SOLO si no hay estado guardado
watch(
  getCompletedExpensesGrouped,
  groups => {
    // Solo aplicar collapseAll si no se ha cargado estado previo
    if (props.filters.collapseAll && !hasLoadedState.value) {
      groups.forEach(group => {
        expandedCompletedGroups.value[group.label] = false
      })
      saveExpandedGroups()
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.account-preview {
  &__expenses {
    overflow-y: scroll;
    flex-grow: 1;
    height: calc(100dvh - 360px);
    padding-right: 15px;
    padding-bottom: 60px;

    @media (min-width: 960px) {
      height: calc(100dvh - 230px);
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
    padding: 10px 0 0;
    border-radius: 10px;
    //background-color: rgba($bg-general, 0.9);
    border-left: 0 solid;

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
      font-size: 0.95rem;
      font-weight: 100;
      font-family: $font-medium;
    }
  }

  &__group-content {
    padding-bottom: 10px;
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

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
  font-size: 0.95rem;
}
</style>
