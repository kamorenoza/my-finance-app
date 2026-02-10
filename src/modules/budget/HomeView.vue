<template>
  <div class="home">
    <div class="general-header">
      <p class="general-title">Mi presupuesto</p>
    </div>

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
        <BudgetList :selected-date="currentDate" :filters="currentFilter" />
      </div>

      <AddBudget />
    </div>

    <AddBudgetSide v-if="mdAndUp" ref="addBudgetSideRef" />
  </div>

  <CategoryManager />
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { useDisplay } from 'vuetify'
import MonthYearSelector from '@/modules/shared/components/MonthYearSelector.vue'
import CategoryManager from '@/modules/categories/CategoryManager.vue'
import BudgetSummary from '@/modules/budget/components/BudgetSummary.vue'
import AddBudget from '@/modules/budget/components/AddBudget.vue'
import BudgetToggle from '../shared/components/BudgetToggle.vue'
import BudgetList from './components/BudgetList.vue'
import SearchOrderFilter from '@/modules/shared/components/SearchOrderFilter.vue'
import { configService } from '@/modules/shared/services/config.service'
import AddBudgetComplete from './components/AddBudgetComplete.vue'
import { useBudgetFilter } from './composables/useBudgetFilter'
import { useBudgetStore } from './budget.store'
import AddBudgetSide from './components/AddBudgetSide.vue'
import AddIcon from '@/assets/icons/Add.icon.vue'
import { colorMdPrimary } from '@/styles/variables.styles'

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

const currentFilter = ref({
  search: '',
  groupBy: 'category' as string | null,
  orderBy: null as string | null,
  initDate: null as Date | null,
  endDate: null as Date | null
})

// Usar el composable para obtener movimientos filtrados
const { filteredAndSortedEntries } = useBudgetFilter({
  selectedDate: currentDate,
  search: computed(() => currentFilter.value.search),
  initDate: computed(() => currentFilter.value.initDate),
  endDate: computed(() => currentFilter.value.endDate)
})

onMounted(() => {
  // Load configuration when component mounts
  const savedConfig = configService.getBudgetConfig()
  if (savedConfig.groupBy !== undefined) {
    currentFilter.value.groupBy = savedConfig.groupBy
  }
  if (savedConfig.orderBy !== undefined) {
    currentFilter.value.orderBy = savedConfig.orderBy
  }
})

// Save configuration when filter changes
watch(
  () => currentFilter.value,
  newFilter => {
    configService.saveBudgetConfig({
      groupBy: newFilter.groupBy,
      orderBy: newFilter.orderBy
    })
  },
  { deep: true }
)

const onFilterChange = (filter: {
  search: string
  groupBy: string | null
  orderBy: string | null
  initDate?: Date | null
  endDate?: Date | null
}) => {
  currentFilter.value = {
    search: filter.search,
    groupBy: filter.groupBy,
    orderBy: filter.orderBy,
    initDate: filter.initDate || null,
    endDate: filter.endDate || null
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
    padding-bottom: 70px;
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
    @media (min-width: 960px) {
      padding: 0;
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
