<template>
  <div class="budget-list">
    <div v-if="filteredAndSortedEntries.length === 0" class="empty-state">
      <p>No hay movimientos para mostrar</p>
    </div>
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
      </template>
      <template v-else>
        <!-- Agrupado con collapse -->
        <template v-for="group in groupedEntries" :key="group.label">
          <p class="budget-group__header" @click="toggleGroup(group.label)">
            <span class="budget-group__header-content">
              <span>{{ group.label }}</span>
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
            <span class="budget-group__total">{{ currency(group.total) }}</span>
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
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { watch, computed, ref } from 'vue'
import BudgetItem from './BudgetItem.vue'
import { useBudgetStore } from '../budget.store'
import { useBudgetFilter } from '../composables/useBudgetFilter'
import type { BudgetEntry } from '../budget.interface'
import dayjs from 'dayjs'

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
const expandedGroups = ref<{ [key: string]: boolean }>({})

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

const calculateGroupTotal = (entries: BudgetEntry[]): number => {
  return entries.reduce((sum, entry) => {
    if (entry.type === 'ingreso') {
      return sum + entry.value
    } else {
      return sum - entry.value
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
        groupKey = entry.category || 'Sin categoría'
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
    total: calculateGroupTotal(entries)
  }))
})

const onEditEntry = (entry: BudgetEntry) => {
  store.setSelectedEntry(entry)
}
</script>

<style scoped lang="scss">
.budget-list {
  height: calc(100vh - 480px);
  overflow-y: scroll;
  padding-bottom: 40px;
  margin-top: 5px;

  @media (min-width: 960px) {
    height: calc(100vh - 220px);
  }
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
  font-size: 0.95rem;
}

.budget-group {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    background-color: #f5f5f5;
    border-radius: 12px;
    margin-bottom: 16px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    font-family: $font-medium;
    font-size: 0.95rem;
    color: #333;

    &:hover {
      background-color: #efefef;
    }

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
  }

  &__total {
    font-weight: 600;
    color: #388e3c;
    font-size: 0.95rem;
  }
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
