<template>
  <div class="budget-list">
    <EmptyState
      v-if="filteredAndSortedEntries.length === 0 && monthExpenses.length === 0"
    />
    <template v-else>
      <template v-if="groupedEntries === null">
        <!-- Sin agrupar -->
        <BudgetItem
          v-for="entry in filteredAndSortedEntries"
          :key="entry.id"
          :entry="entry"
          :reference-date="props.selectedDate || new Date()"
          @edit="onEditEntry"
        />

        <!-- Grupo de Gastos del mes (sin agrupar) -->
        <div v-if="monthExpenses.length > 0" class="month-expenses-group">
          <p
            class="budget-group__header budget-group__header--expenses mb-0"
            @click="toggleGroup('gastos-del-mes')"
          >
            <span class="month-expenses-toggle" @click.stop>
              <v-switch
                v-model="addExpensesToBudget"
                color="success"
                hide-details
                density="compact"
                inset
              />
            </span>
            <span class="budget-group__header-content">
              <span>Gastos del mes</span>
              <span class="budget-group__chevron">
                <v-icon size="17">
                  {{
                    expandedGroups['gastos-del-mes'] === false
                      ? 'mdi-chevron-down'
                      : 'mdi-chevron-up'
                  }}
                </v-icon>
              </span>
            </span>
            <span class="budget-group__total">{{
              currency(totalMonthExpenses)
            }}</span>
          </p>
          <transition name="slide">
            <div
              v-show="expandedGroups['gastos-del-mes'] !== false"
              class="month-expenses-content"
            >
              <div class="month-expenses-list">
                <ExpenseItem
                  v-for="expense in monthExpenses"
                  :key="expense.id"
                  :expense="expense"
                  :read-only="true"
                />
              </div>
            </div>
          </transition>
        </div>
      </template>
      <template v-else>
        <!-- Agrupado con collapse -->
        <template v-for="group in groupedEntries" :key="group.label">
          <p class="budget-group__header" @click="toggleGroup(group.label)">
            <span class="budget-group__header-content">
              <span>{{ formatGroupName(group.label) }}</span>
              <span class="budget-group__chevron">
                <v-icon size="17">
                  {{
                    expandedGroups[group.label] === false
                      ? 'mdi-chevron-down'
                      : 'mdi-chevron-up'
                  }}
                </v-icon>
              </span>
            </span>
            <span class="budget-group__total">{{
              currency(Math.abs(group.total))
            }}</span>
          </p>
          <transition name="slide">
            <div v-show="expandedGroups[group.label] !== false">
              <BudgetItem
                v-for="entry in group.entries"
                :key="entry.id"
                :entry="entry"
                :reference-date="props.selectedDate || new Date()"
                @edit="onEditEntry"
              />
            </div>
          </transition>
        </template>

        <!-- Grupo de Gastos del mes -->
        <div v-if="monthExpenses.length > 0" class="month-expenses-group">
          <p
            class="budget-group__header budget-group__header--expenses mb-0"
            @click="toggleGroup('gastos-del-mes')"
          >
            <span class="month-expenses-toggle" @click.stop>
              <v-switch
                v-model="addExpensesToBudget"
                color="success"
                hide-details
                density="compact"
                inset
              />
            </span>
            <span class="budget-group__header-content">
              <span>Gastos del mes</span>
              <span class="budget-group__chevron">
                <v-icon size="17">
                  {{
                    expandedGroups['gastos-del-mes'] === false
                      ? 'mdi-chevron-down'
                      : 'mdi-chevron-up'
                  }}
                </v-icon>
              </span>
            </span>
            <span class="budget-group__total">{{
              currency(totalMonthExpenses)
            }}</span>
          </p>
          <transition name="slide">
            <div
              v-show="expandedGroups['gastos-del-mes'] !== false"
              class="month-expenses-content"
            >
              <div class="month-expenses-list">
                <ExpenseItem
                  v-for="expense in monthExpenses"
                  :key="expense.id"
                  :expense="expense"
                  :read-only="true"
                />
              </div>
            </div>
          </transition>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { watch, computed, ref, onMounted } from 'vue'
import BudgetItem from './BudgetItem.vue'
import { useBudgetStore } from '../budget.store'
import { useBudgetFilter } from '../composables/useBudgetFilter'
import type { BudgetEntry } from '../budget.interface'
import dayjs from 'dayjs'
import { configService } from '@/modules/shared/services/config.service'
import { backupService } from '@/modules/shared/services/backup.service'
import { useExpensesStore } from '@/modules/expenses/expenses.store'
import ExpenseItem from '@/modules/expenses/components/ExpenseItem.vue'
import { dateFormatter } from '@/modules/shared/utils'
import EmptyState from '@/modules/shared/components/EmptyState.vue'

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
}

const props = withDefaults(defineProps<Props>(), {
  selectedDate: undefined,
  filters: () => ({
    search: '',
    groupBy: null,
    orderBy: null,
    initDate: null,
    endDate: null
  })
})

const store = useBudgetStore()
const expensesStore = useExpensesStore()
const expandedGroups = ref<{ [key: string]: boolean }>({})
const hasLoadedState = ref(false)
// Usar el estado del toggle desde el store
const addExpensesToBudget = computed({
  get: () => store.addExpensesToBudget,
  set: (value: boolean) => {
    store.addExpensesToBudget = value
    const currentConfig = configService.getBudgetConfig()
    configService.saveBudgetConfig({
      ...currentConfig,
      addExpensesToBudget: value
    })
    backupService.queueBackup()
  }
})

// Cargar estado de grupos expandidos al montar
onMounted(() => {
  const savedConfig = configService.getBudgetConfig()
  if (
    savedConfig.expandedGroups &&
    Object.keys(savedConfig.expandedGroups).length > 0
  ) {
    expandedGroups.value = { ...savedConfig.expandedGroups }
    hasLoadedState.value = true
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

const currency = (value: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value)

const toggleGroup = (groupLabel: string) => {
  expandedGroups.value[groupLabel] =
    expandedGroups.value[groupLabel] !== false ? false : true

  // Guardar el estado
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

// Formatear nombre del grupo (para fechas)
const formatGroupName = (groupName: string) => {
  if (props.filters?.groupBy === 'date') {
    // groupName está en formato 'DD/MM/YYYY', convertir a Date y formatear
    const [day, month, year] = groupName.split('/')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return dateFormatter(date)
  }
  return groupName
}

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

// Watcher para manejar collapseAll (solo cuando cambia, no al iniciar)
watch(
  () => props.filters?.collapseAll,
  (collapseAll, oldValue) => {
    // Solo ejecutar si hay un cambio real (no undefined -> true al montar)
    if (collapseAll && oldValue !== undefined && groupedEntries.value) {
      // Colapsar todos los grupos
      groupedEntries.value.forEach(group => {
        expandedGroups.value[group.label] = false
      })
      saveExpandedGroups()
    }
  }
)

// Watcher en groupedEntries para aplicar collapseAll SOLO si no hay estado guardado
watch(
  groupedEntries,
  groups => {
    // Solo aplicar collapseAll si no se ha cargado estado previo
    if (props.filters?.collapseAll && groups && !hasLoadedState.value) {
      groups.forEach(group => {
        expandedGroups.value[group.label] = false
      })
      saveExpandedGroups()
    }
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

.budget-group {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 5px;
    border-radius: 12px;
    margin-bottom: 5px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    font-family: $font-medium;
    font-size: 0.95rem;
    color: #333;

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

.month-expenses-group {
  margin-top: 10px;
  padding-top: 0px;
  border-top: 1px solid $bg-general;
}

.month-expenses-toggle {
  display: flex;
  align-items: center;
  margin-right: 8px;
  flex-shrink: 0;
}

.month-expenses-list {
  margin-top: 0px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
}
</style>
