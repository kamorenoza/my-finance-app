<template>
  <div class="budget-by-category">
    <!-- Sección de Ingresos Generales -->
    <div class="budget-by-category__section">
      <div class="budget-by-category__section-header budget-by-category__section-header--split">
        <v-text-field
          v-model="searchQuery"
          class="search-input budget-by-category__search"
          label="Buscar"
          density="compact"
        >
          <template v-slot:prepend>
            <SearchIcon />
          </template>
        </v-text-field>
        <v-btn
          class="budget-by-category__add-movimiento budget-by-category__add-income"
          height="36"
          icon
          @click="openAddIncomeDrawer"
        >
          <v-icon size="22">mdi-plus</v-icon>
        </v-btn>
      </div>

      <div v-if="generalIncomes.length === 0" class="budget-by-category__empty">
        <p>No hay ingresos registrados</p>
        <v-btn class="button-secondary" @click="openAddIncomeDrawer">
          Agregar ingreso
        </v-btn>
      </div>

      <div v-else class="budget-by-category__incomes">
        <GeneralIncomeItem
          v-for="income in displayedIncomes"
          :key="income.id"
          :income="income"
          @edit="handleEditIncome"
        />
      </div>
    </div>

    <!-- Sección de Categorías de Presupuesto -->
    <div class="budget-by-category__section">
      <div class="budget-by-category__categories-header">
        <div class="budget-by-category__categories-row">
          <h2 class="budget-by-category__section-title">Categorías</h2>
          <div class="budget-by-category__categories-top">
            <v-btn
              class="budget-by-category__add-movimiento budget-by-category__add-gasto"
              height="28"
              @click="openAddBudgetDrawer"
            >
              <v-icon size="15" start>mdi-plus</v-icon>
              Agregar gasto
            </v-btn>
            <v-btn class="btn-circle" @click="openAddCategoryDrawer">
              <v-icon size="20" color="#8971AD">mdi-plus</v-icon>
            </v-btn>
          </div>
        </div>
        <div class="budget-by-category__cards">
          <div class="budget-by-category__card">
            <span class="budget-by-category__card-label">Total categorías</span>
            <span class="budget-by-category__card-value">
              {{ currencyFormatter(totalBudget) }}
            </span>
          </div>
          <div class="budget-by-category__card">
            <span class="budget-by-category__card-label">Disponible</span>
            <span class="budget-by-category__card-value budget-by-category__card-value--available">
              {{ currencyFormatter(availableBudget) }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="budgetCategories.length === 0 && uncategorizedEntries.length === 0" class="budget-by-category__empty">
        <p>No hay categorías de presupuesto</p>
        <v-btn class="button-secondary" @click="openAddCategoryDrawer">
          Agregar categoría
        </v-btn>
      </div>

      <div v-else class="budget-by-category__categories">
        <!-- Categorías definidas -->
        <BudgetCategoryItem
          v-for="category in displayedCategories"
          :key="category.id"
          :category="category"
          :selected-date="selectedDate"
          :force-expand="isSearching"
          @edit="handleEditCategory"
          @edit-entry="handleEditEntry"
        />

        <!-- Categoría "Otros" (sin categoría) -->
        <div v-if="displayedUncategorizedEntries.length > 0" class="budget-category-otros">
          <div class="budget-category-otros__header" @click="toggleOthers">
            <div class="budget-category-otros__info">
              <h3 class="budget-category-otros__name">Otros</h3>
              <p class="budget-category-otros__amount">
                {{ currencyFormatter(othersSpent) }}
              </p>
            </div>
            <v-icon :class="{ 'rotated': isOthersExpanded }">mdi-chevron-down</v-icon>
          </div>

          <v-expand-transition>
            <div v-if="isOthersExpanded || isSearching" class="budget-category-otros__content">
              <div class="budget-category-otros__entries">
                <BudgetItem
                  v-for="entry in displayedUncategorizedEntries"
                  :key="entry.id"
                  :entry="entry"
                  :reference-date="selectedDate"
                  @edit="handleEditEntry"
                />
              </div>
            </div>
          </v-expand-transition>
        </div>
      </div>
    </div>

    <!-- Drawers -->
    <AddGeneralIncome ref="addGeneralIncomeRef" />
    <AddBudgetCategory ref="addBudgetCategoryRef" />
    <AddBudgetSide v-if="mdAndUp" ref="addBudgetSideRef" />
    <AddBudgetComplete v-else ref="addBudgetCompleteRef" hide-button />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useBudgetStore } from '../budget.store'
import { currencyFormatter } from '@/modules/shared/utils'
import GeneralIncomeItem from './GeneralIncomeItem.vue'
import BudgetCategoryItem from './BudgetCategoryItem.vue'
import BudgetItem from './BudgetItem.vue'
import AddGeneralIncome from './AddGeneralIncome.vue'
import AddBudgetCategory from './AddBudgetCategory.vue'
import AddBudgetSide from './AddBudgetSide.vue'
import AddBudgetComplete from './AddBudgetComplete.vue'
import SearchIcon from '@/assets/icons/Search.icon.vue'
import type { GeneralIncome, BudgetCategory, BudgetEntry } from '../budget.interface'

const props = defineProps<{
  selectedDate: Date
}>()

const budgetStore = useBudgetStore()
const { mdAndUp } = useDisplay()
const addGeneralIncomeRef = ref()
const addBudgetCategoryRef = ref()
const addBudgetSideRef = ref()
const addBudgetCompleteRef = ref()
const isOthersExpanded = ref(false)
const searchQuery = ref('')

const normalizedQuery = computed(() => (searchQuery.value || '').trim().toLowerCase())
const isSearching = computed(() => normalizedQuery.value.length > 0)

// Mantener el mes del store sincronizado con el selector
watch(
  () => props.selectedDate,
  newDate => {
    if (newDate) {
      budgetStore.selectedDate = newDate
    }
  },
  { immediate: true }
)

const generalIncomes = computed(() => budgetStore.filteredGeneralIncomes)
const budgetCategories = computed(() => budgetStore.budgetCategories)

const sortedCategories = computed(() => {
  return [...budgetCategories.value].sort((a, b) => (a.order || 0) - (b.order || 0))
})

const displayedIncomes = computed(() => {
  if (!isSearching.value) return generalIncomes.value
  return generalIncomes.value.filter(i =>
    i.name.toLowerCase().includes(normalizedQuery.value)
  )
})

const displayedCategories = computed(() => {
  if (!isSearching.value) return sortedCategories.value
  return sortedCategories.value.filter(cat => {
    const name = budgetStore
      .getCategoryDisplayName(cat, props.selectedDate)
      .toLowerCase()
    if (name.includes(normalizedQuery.value)) return true
    return budgetStore.filteredEntries.some(
      e =>
        e.budgetCategoryId === cat.id &&
        e.name.toLowerCase().includes(normalizedQuery.value)
    )
  })
})

const totalIncome = computed(() => budgetStore.totalGeneralIncome)

const totalBudget = computed(() => {
  const categoriesTotal = budgetCategories.value.reduce(
    (sum, cat) => sum + budgetStore.getCategoryDisplayBudget(cat, props.selectedDate),
    0
  )
  return categoriesTotal + othersSpent.value
})

const availableBudget = computed(() => totalIncome.value - totalBudget.value)

const uncategorizedEntries = computed(() => {
  const validIds = new Set(budgetCategories.value.map(c => c.id))
  return budgetStore.filteredEntries.filter(
    e =>
      e.type === 'gasto' &&
      (!e.budgetCategoryId || !validIds.has(e.budgetCategoryId))
  )
})

const displayedUncategorizedEntries = computed(() => {
  if (!isSearching.value) return uncategorizedEntries.value
  return uncategorizedEntries.value.filter(e =>
    e.name.toLowerCase().includes(normalizedQuery.value)
  )
})

const othersSpent = computed(() => {
  return uncategorizedEntries.value
    .filter(e => e.type === 'gasto')
    .reduce((sum, e) => sum + budgetStore.getDisplayValue(e, props.selectedDate), 0)
})

const toggleOthers = () => {
  isOthersExpanded.value = !isOthersExpanded.value
}

const openAddIncomeDrawer = () => {
  addGeneralIncomeRef.value?.openDrawer()
}

const handleEditIncome = (income: GeneralIncome) => {
  addGeneralIncomeRef.value?.openDrawer(income)
}

const openAddCategoryDrawer = () => {
  addBudgetCategoryRef.value?.openDrawer()
}

const handleEditCategory = (category: BudgetCategory) => {
  addBudgetCategoryRef.value?.openDrawer(category)
}

const handleEditEntry = (entry: BudgetEntry) => {
  budgetStore.setSelectedEntry(entry)
}

const openAddBudgetDrawer = () => {
  budgetStore.setSelectedEntry(null)
  if (mdAndUp.value) {
    addBudgetSideRef.value?.openDrawer('Agregar gasto')
  } else {
    addBudgetCompleteRef.value?.open()
  }
}
</script>

<style scoped lang="scss">
.budget-by-category {
  padding: 5px 12px 80px 0;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  margin-top: 0;

  @media (min-width: 960px) {
    padding: 5px 12px 80px 0;
    flex: none;
    height: calc(100vh - 220px);
  }

  &__section {
    margin-bottom: 24px;
  }

  &__section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    &--end {
      justify-content: flex-end;
      margin-bottom: 12px;
    }

    &--split {
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    }
  }

  &__search {
    flex: 1;
  }

  &__section-title {
    font-family: "PoppinsMedium", serif !important;
    font-weight: normal !important;
    font-size: 16px;
    color: $text-dark;
    margin: 0;
  }

  &__section-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__categories-header {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  &__categories-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__categories-top {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__cards {
    display: flex;
    gap: 10px;
  }

  &__card {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px 14px;
    background: $bg-item;
    border-radius: 16px;
  }

  &__card-label {
    font-family: $font;
    font-size: 12px;
    color: $text-gray-md;
  }

  &__card-value {
    font-family: $font-medium;
    font-size: 15px;
    color: $text-dark;

    &--available {
      color: $color-green;
    }
  }

  &__section-total {
    font-family: $font-medium;
    font-size: 15px;
    color: $color-green;
  }

  &__empty {
    text-align: center;
    padding: 32px 16px;
    background: $white;
    border-radius: 16px;
    color: $text-gray-md;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;

    p {
      margin: 0;
      font-size: 14px;
    }
  }

  &__incomes {
    margin-bottom: 12px;
  }

  &__categories {
    // Estilos ya manejados por BudgetCategoryItem
  }

  &__add-movimiento {
    font-size: 12px;
    border-radius: 8px !important;
    background-color: $color-md-primary !important;
    color: $color-primary !important;
    font-family: $font !important;
    text-transform: none;
    letter-spacing: normal;
    box-shadow: none !important;
  }

  &__add-income {
    flex-shrink: 0;
    width: 40px !important;
    min-width: 40px !important;
    border-radius: 12px !important;
    background-color: $green-md !important;
    color: $color-green !important;
  }

  &__add-gasto {
    border-radius: 10px !important;
    background-color: $color-bg-red !important;
    color: $color-red !important;
  }
}

.budget-category-otros {
  background: $bg-item;
  border-radius: 16px;
  margin-top: 16px;
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    cursor: pointer;
    user-select: none;

    &:hover {
      background: $bg-general;
    }

    .v-icon {
      transition: transform 0.3s ease;
      color: $text-gray-md;

      &.rotated {
        transform: rotate(180deg);
      }
    }
  }

  &__info {
    flex: 1;
  }

  &__name {
    font-family: $font-medium;
    font-size: 15px;
    color: $text-gray-md;
    margin: 0 0 4px 0;
  }

  &__amount {
    font-family: $font;
    font-size: 13px;
    color: $text-gray-md;
    margin: 0;
  }

  &__content {
    padding: 0 16px 16px;
  }

  &__entries {
    // Estilos manejados por BudgetItem
    :deep(.budget-item) {
      background-color: $white;
    }
  }
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: $color-md-primary;
  color: $color-primary;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: $color-primary;
    color: $white;
  }

  &:active {
    transform: scale(0.95);
  }
}

.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
}
</style>