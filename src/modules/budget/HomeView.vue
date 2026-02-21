<template>
  <div class="home">
    <PageHeader title="Mi presupuesto" />

    <div class="home__content">
      <div class="home__header">
        <div class="home__selector">
          <MonthYearSelector v-model="currentDate" />
        </div>
        <div class="home__toggle">
          <BudgetToggle v-model="budgetToggle" />
        </div>

        <BudgetSummary
          :budget-toggle="budgetToggle"
          :filtered-entries="filteredAndSortedEntries"
          :selected-date="currentDate"
        />
      </div>

      <div class="home__body">
        <div class="home__filter">
          <SearchOrderFilter
            search-label="Buscar"
            :initial-group-by="currentFilter.groupBy"
            :initial-order-by="currentFilter.orderBy"
            :initial-collapse-all="currentFilter.collapseAll"
            @filterChange="onFilterChange"
            hide-date-filter
          />
          <AddBudgetComplete v-if="!mdAndUp" />
          <div class="home__add-btn" v-if="mdAndUp">
            <v-tooltip text="Agregar presupuesto" location="left">
              <template v-slot:activator="{ props }">
                <v-btn
                  :color="colorMdPrimary"
                  class="btn-fab fab-button"
                  @click="openAddBudgetDrawer"
                  v-bind="props"
                >
                  <AddIcon class="icon" />
                </v-btn>
              </template>
            </v-tooltip>
          </div>
        </div>
        <div>
          <button
            v-if="canReorder"
            class="home__reorder-btn"
            :class="{ 'home__reorder-btn--active': reorderMode }"
            @click="reorderMode = !reorderMode"
          >
            <v-icon size="16">mdi-swap-vertical</v-icon>
            {{ reorderMode ? 'Listo' : 'Reorganizar' }}
          </button>
        </div>
        <BudgetList
          :selected-date="currentDate"
          :filters="currentFilter"
          :reorder-mode="reorderMode"
        />
      </div>
    </div>

    <AddBudgetSide v-if="mdAndUp" ref="addBudgetSideRef" />
  </div>

  <CategoryManager />
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useDisplay } from 'vuetify'
import MonthYearSelector from '@/modules/shared/components/MonthYearSelector.vue'
import CategoryManager from '@/modules/categories/CategoryManager.vue'
import BudgetSummary from '@/modules/budget/components/BudgetSummary.vue'
import BudgetToggle from '../shared/components/BudgetToggle.vue'
import BudgetList from './components/BudgetList.vue'
import SearchOrderFilter from '@/modules/shared/components/SearchOrderFilter.vue'
import PageHeader from '@/modules/shared/components/PageHeader.vue'
import { configService } from '@/modules/shared/services/config.service'
import AddBudgetComplete from './components/AddBudgetComplete.vue'
import { useBudgetFilter } from './composables/useBudgetFilter'
import { useBudgetStore } from './budget.store'
import AddBudgetSide from './components/AddBudgetSide.vue'
import AddIcon from '@/assets/icons/Add.icon.vue'
import { colorMdPrimary } from '@/styles/variables.styles'
import { backupService } from '@/modules/shared/services/backup.service'

const { mdAndUp } = useDisplay()

const currentDate = ref(new Date())
const budgetToggle = ref('budget')
const addBudgetSideRef = ref()
const budgetStore = useBudgetStore()

const openAddBudgetDrawer = () => {
  budgetStore.setSelectedEntry(null)
  if (addBudgetSideRef.value) {
    addBudgetSideRef.value.openDrawer()
  }
}

// Load configuration synchronously in setup so values are correct from the start
// and never mutate during mount (which would wrongly trigger the deep watcher and call queueBackup)
const savedBudgetConfig = configService.getBudgetConfig()

const currentFilter = ref({
  search: '',
  groupBy: (savedBudgetConfig.groupBy !== undefined
    ? savedBudgetConfig.groupBy
    : 'category') as string | null,
  orderBy: (savedBudgetConfig.orderBy !== undefined
    ? savedBudgetConfig.orderBy
    : null) as string | null,
  initDate: null as Date | null,
  endDate: null as Date | null,
  collapseAll: savedBudgetConfig.collapseAll ?? false
})

const reorderMode = ref(false)
const canReorder = computed(() => {
  const g = currentFilter.value.groupBy
  return !!g && g !== 'none' && g !== 'date'
})

// Usar el composable para obtener movimientos filtrados
const { filteredAndSortedEntries } = useBudgetFilter({
  selectedDate: currentDate,
  search: computed(() => currentFilter.value.search),
  initDate: computed(() => currentFilter.value.initDate),
  endDate: computed(() => currentFilter.value.endDate)
})

// Save configuration when filter changes
watch(
  () => currentFilter.value,
  newFilter => {
    configService.saveBudgetConfig({
      groupBy: newFilter.groupBy,
      orderBy: newFilter.orderBy,
      collapseAll: newFilter.collapseAll
    })
    backupService.queueBackup()
  },
  { deep: true }
)

// Reset reorder mode when groupBy changes to a non-reorderable option
watch(
  () => currentFilter.value.groupBy,
  groupBy => {
    if (!groupBy || groupBy === 'none' || groupBy === 'date') {
      reorderMode.value = false
    }
  }
)

const onFilterChange = (filter: {
  search: string
  groupBy: string | null
  orderBy: string | null
  initDate?: Date | null
  endDate?: Date | null
  collapseAll?: boolean
}) => {
  currentFilter.value = {
    search: filter.search,
    groupBy: filter.groupBy,
    orderBy: filter.orderBy,
    initDate: filter.initDate || null,
    endDate: filter.endDate || null,
    collapseAll: filter.collapseAll || false
  }
}
</script>

<style scoped lang="scss">
.home {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;

  @media (min-width: 960px) {
    padding-left: 20px;
  }
  &__header {
    @media (min-width: 960px) {
      flex-grow: 0;
    }
  }

  &__content {
    position: relative;
    @media (min-width: 960px) {
      display: flex;
      gap: 20px;
      padding-right: 20px;
    }
  }

  &__selector {
    display: flex;
    align-items: center;
    gap: 15px;
    justify-content: center;
  }

  &__body {
    height: calc(100dvh - 335px);
    padding: 12px;
    padding-bottom: 20px;
    padding-right: 0;

    @media (min-width: 960px) {
      flex-grow: 1;
    }
  }

  &__toggle {
    display: flex;
    justify-content: center;
    margin-top: 10px;
    padding-right: 4px;

    @media (min-width: 960px) {
      display: none;
    }
  }

  &__filter {
    display: flex;
    gap: 10px;
    padding-right: 15px;
    align-items: center;
    margin-bottom: 10px;
    @media (min-width: 960px) {
      padding: 0;
    }
  }

  &__reorder-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    font-family: $font-medium;
    color: $text-gray-md;
    background: transparent;
    border: 1px solid #e0e0e0;
    border-radius: 20px;
    padding: 4px 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    margin-left: auto;
    margin-right: 15px;

    &--active {
      color: $color-primary;
      border-color: $color-primary;
      background-color: rgba($color-primary, 0.06);
    }
  }

  &__add-btn {
    display: none;

    @media (min-width: 960px) {
      display: flex;
      justify-content: center;
    }
  }
}

.fab-button {
  width: 40px !important;
  height: 40px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px !important;
}
</style>
