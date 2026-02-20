<template>
  <div class="budget-list">
    <EmptyState
      v-if="filteredAndSortedEntries.length === 0 && monthExpenses.length === 0"
    />
    <template v-else>
      <BudgetUngroupedView
        v-if="groupedEntries === null"
        :entries="filteredAndSortedEntries"
        :reference-date="props.selectedDate || new Date()"
        :month-expenses="monthExpenses"
        :total-month-expenses="totalMonthExpenses"
        :add-expenses-to-budget="addExpensesToBudget"
        :expanded-groups="expandedGroups"
        @edit="onEditEntry"
        @toggle-group="toggleGroup"
        @update:add-expenses-to-budget="updateAddExpensesToBudget"
      />
      <BudgetGroupedView
        v-else
        :groups="orderedGroupEntries!"
        :reference-date="props.selectedDate || new Date()"
        :group-by="props.filters?.groupBy ?? null"
        :month-expenses="monthExpenses"
        :total-month-expenses="totalMonthExpenses"
        :add-expenses-to-budget="addExpensesToBudget"
        :expanded-groups="expandedGroups"
        :reorder-mode="reorderMode"
        @edit="onEditEntry"
        @toggle-group="toggleGroup"
        @update:add-expenses-to-budget="updateAddExpensesToBudget"
        @reorder="handleGroupReorder"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { watch, computed, ref, onMounted } from 'vue'
import { useBudgetStore } from '../budget.store'
import { useBudgetFilter } from '../composables/useBudgetFilter'
import type { BudgetEntry } from '../budget.interface'
import dayjs from 'dayjs'
import { configService } from '@/modules/shared/services/config.service'
import { backupService } from '@/modules/shared/services/backup.service'
import { useExpensesStore } from '@/modules/expenses/expenses.store'
import EmptyState from '@/modules/shared/components/EmptyState.vue'
import BudgetUngroupedView from './BudgetUngroupedView.vue'
import BudgetGroupedView from './BudgetGroupedView.vue'

interface BudgetGroup {
  label: string
  total: number
  entries: BudgetEntry[]
}

interface Props {
  selectedDate?: Date
  filters?: {
    search: string
    groupBy: string | null
    orderBy: string | null
    initDate?: Date | null
    endDate?: Date | null
    collapseAll?: boolean
  }
  reorderMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selectedDate: undefined,
  filters: () => ({
    search: '',
    groupBy: null,
    orderBy: null,
    initDate: null,
    endDate: null
  }),
  reorderMode: false
})

const store = useBudgetStore()
const expensesStore = useExpensesStore()
const expandedGroups = ref<{ [key: string]: boolean }>({})
const savedGroupOrders = ref<Record<string, string[]>>({})
// Usar el estado del toggle desde el store
const addExpensesToBudget = computed(() => store.addExpensesToBudget)

const updateAddExpensesToBudget = (value: boolean) => {
  store.addExpensesToBudget = value
  const currentConfig = configService.getBudgetConfig()
  configService.saveBudgetConfig({
    ...currentConfig,
    addExpensesToBudget: value
  })
  backupService.queueBackup()
}

// Cargar estado de grupos expandidos al montar
onMounted(() => {
  const savedConfig = configService.getBudgetConfig()
  if (
    savedConfig.expandedGroups &&
    Object.keys(savedConfig.expandedGroups).length > 0
  ) {
    expandedGroups.value = { ...savedConfig.expandedGroups }
  }
  // Cargar orden de grupos guardado
  if (savedConfig.groupOrders) {
    savedGroupOrders.value = savedConfig.groupOrders
  }
  // Colapsar por defecto el grupo de gastos del mes
  if (expandedGroups.value['gastos-del-mes'] === undefined) {
    expandedGroups.value['gastos-del-mes'] = false
  }
})

// Usar useBudgetFilter para obtener entries filtrados
const { filteredAndSortedEntries: baseFilteredEntries } = useBudgetFilter({
  selectedDate: computed(() => props.selectedDate || new Date()),
  search: computed(() => props.filters?.search || ''),
  initDate: computed(() => props.filters?.initDate || null),
  endDate: computed(() => props.filters?.endDate || null)
})

watch(
  () => props.selectedDate,
  newDate => {
    if (newDate) {
      store.selectedDate = newDate
    }
  },
  { immediate: true }
)

const toggleGroup = (groupLabel: string) => {
  const current = expandedGroups.value[groupLabel]
  // undefined = expanded by default, so toggling means collapsing
  expandedGroups.value[groupLabel] = current === false ? true : false
  saveExpandedGroups()
}

const saveExpandedGroups = () => {
  const currentConfig = configService.getBudgetConfig()
  configService.saveBudgetConfig({
    ...currentConfig,
    expandedGroups: { ...expandedGroups.value }
  })
  backupService.queueBackup()
}

// Aplicar ordenamiento
const filteredAndSortedEntries = computed(() => {
  const sorted = [...baseFilteredEntries.value]
  if (props.filters?.orderBy) {
    switch (props.filters.orderBy) {
      case 'newest':
        sorted.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        break
      case 'oldest':
        sorted.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
        break
      case 'highest':
        sorted.sort((a, b) => b.value - a.value)
        break
      case 'lowest':
        sorted.sort((a, b) => a.value - b.value)
        break
    }
  }

  return sorted
})

const calculateGroupTotal = (entries: BudgetEntry[], dateRef: Date): number => {
  return entries.reduce((sum, entry) => {
    const displayValue = store.getDisplayValue(entry, dateRef)
    if (entry.type === 'ingreso') {
      return sum + displayValue
    } else {
      return sum - displayValue
    }
  }, 0)
}

const groupedEntries = computed((): BudgetGroup[] | null => {
  if (!props.filters?.groupBy || props.filters.groupBy === 'none') {
    return null
  }

  const groups: { [key: string]: BudgetEntry[] } = {}

  filteredAndSortedEntries.value.forEach(entry => {
    let groupKey = ''

    switch (props.filters!.groupBy) {
      case 'type':
        groupKey = entry.type === 'ingreso' ? 'Ingresos' : 'Gastos'
        break
      case 'category':
        groupKey = entry.category?.name || 'Sin categoría'
        break
      case 'date':
        groupKey = dayjs(entry.date).format('DD/MM/YYYY')
        break
      default:
        groupKey = 'Otros'
    }

    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(entry)
  })

  // Convertir a array de grupos con totales
  return Object.entries(groups).map(([label, entries]) => ({
    label,
    entries,
    total: calculateGroupTotal(entries, props.selectedDate || new Date())
  }))
})

// Aplicar el orden guardado a los grupos
const orderedGroupEntries = computed((): BudgetGroup[] | null => {
  if (!groupedEntries.value) return null
  const groupBy = props.filters?.groupBy || 'none'
  const savedOrder = savedGroupOrders.value[groupBy] || []
  if (!savedOrder.length) return groupedEntries.value
  const orderMap = new Map(savedOrder.map((label, idx) => [label, idx]))
  return [...groupedEntries.value].sort((a, b) => {
    const ia = orderMap.has(a.label) ? orderMap.get(a.label)! : Infinity
    const ib = orderMap.has(b.label) ? orderMap.get(b.label)! : Infinity
    return ia - ib
  })
})

const handleGroupReorder = (newLabels: string[]) => {
  const groupBy = props.filters?.groupBy || 'none'
  savedGroupOrders.value = { ...savedGroupOrders.value, [groupBy]: newLabels }
  const currentConfig = configService.getBudgetConfig()
  configService.saveBudgetConfig({
    ...currentConfig,
    groupOrders: savedGroupOrders.value
  })
  backupService.queueBackup()
}

// Watcher para manejar collapseAll cuando cambia
watch(
  () => props.filters?.collapseAll,
  (collapseAll, oldValue) => {
    if (oldValue === undefined) return // skip initial call
    if (!groupedEntries.value) return

    const isExpanded = !collapseAll
    groupedEntries.value.forEach(group => {
      expandedGroups.value[group.label] = isExpanded
    })
    expandedGroups.value['gastos-del-mes'] = isExpanded
    saveExpandedGroups()
  }
)

// Watcher en groupedEntries para aplicar collapseAll a grupos nuevos (ej: cambio de mes)
watch(
  groupedEntries,
  groups => {
    if (!groups) return
    const isCollapsed = props.filters?.collapseAll
    groups.forEach(group => {
      if (expandedGroups.value[group.label] === undefined) {
        // Nuevo grupo sin estado previo: aplicar collapseAll
        expandedGroups.value[group.label] = !isCollapsed
      }
    })
  },
  { immediate: true }
)

const onEditEntry = (entry: BudgetEntry) => {
  store.setSelectedEntry(entry)
}

// Filtrar gastos del mes seleccionado
const monthExpenses = computed(() => {
  const month = dayjs(props.selectedDate).startOf('month')
  const monthEnd = dayjs(props.selectedDate).endOf('month')
  const searchTerm = props.filters?.search?.toLowerCase() || ''

  return expensesStore.expenses.filter(expense => {
    const expenseDate = dayjs(expense.date)
    const dateMatch =
      (expenseDate.isAfter(month) && expenseDate.isBefore(monthEnd)) ||
      expenseDate.isSame(month, 'day') ||
      expenseDate.isSame(monthEnd, 'day')

    // Si no hay búsqueda, retornar solo por fecha
    if (!searchTerm) {
      return dateMatch
    }

    // Aplicar filtro de búsqueda
    const searchMatch = expense.name.toLowerCase().includes(searchTerm)

    return dateMatch && searchMatch
  })
})

// Calcular total de gastos del mes
const totalMonthExpenses = computed(() => {
  return monthExpenses.value.reduce((sum, expense) => sum + expense.value, 0)
})
</script>

<style scoped lang="scss">
.budget-list {
  height: calc(100vh - 400px);
  overflow-y: scroll;
  padding-bottom: 40px;
  margin-top: 5px;
  padding-right: 12px;

  @media (min-width: 960px) {
    height: calc(100vh - 220px);
  }
}
</style>
