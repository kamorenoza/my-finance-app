<template>
  <div class="budget-category-item">
    <div class="budget-category-item__header" @click="toggleExpanded">
      <div class="budget-category-item__left">
        <div
          class="budget-category-item__icon"
          :style="{ backgroundColor: category.color || colorPrimary }"
        >
          <component :is="categoryIconComponent" :color="colorWhite" />
        </div>
        <div class="budget-category-item__info">
          <h3 class="budget-category-item__name">{{ displayName }}</h3>
          <p class="budget-category-item__amount">
            {{ currencyFormatter(spent) }} / {{ currencyFormatter(displayBudget) }}
          </p>
        </div>
      </div>
      <div class="budget-category-item__right">
        <span
          class="budget-category-item__available"
          :style="{ color: available >= 0 ? colorGreen : red }"
        >
          {{ currencyFormatter(available) }}
        </span>
        <v-icon :class="{ 'rotated': shouldExpand }">mdi-chevron-down</v-icon>
      </div>
    </div>

    <div class="budget-category-item__progress">
      <div
        class="budget-category-item__progress-bar"
        :style="{ width: progressPercentage + '%', backgroundColor: progressColor }"
      ></div>
    </div>

    <v-expand-transition>
      <div v-if="shouldExpand" class="budget-category-item__content">
        <div
          v-if="categoryEntries.length === 0"
          class="budget-category-item__empty"
        >
          <p>Sin movimientos en esta categoría</p>
        </div>

        <div v-else class="budget-category-item__entries">
          <BudgetItem
            v-for="entry in categoryEntries"
            :key="entry.id"
            :entry="entry"
            :reference-date="selectedDate"
            hide-icon
            @edit="emit('edit-entry', $event)"
          />
        </div>

        <div class="budget-category-item__actions">
          <button class="button-secondary btn-sm" @click="handleEdit">
            <v-icon size="16">mdi-pencil</v-icon>
            Editar
          </button>
        </div>
      </div>
    </v-expand-transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { BudgetCategory, BudgetEntry } from '../budget.interface'
import { useBudgetStore } from '../budget.store'
import { currencyFormatter } from '@/modules/shared/utils'
import { getIcon } from '@/modules/categories/categories.constants'
import { colorPrimary, colorWhite, colorGreen, red } from '@/styles/variables.styles'
import BudgetItem from './BudgetItem.vue'

const props = defineProps<{
  category: BudgetCategory
  selectedDate: Date
  forceExpand?: boolean
}>()

const emit = defineEmits<{
  edit: [category: BudgetCategory]
  'edit-entry': [entry: BudgetEntry]
}>()

const budgetStore = useBudgetStore()
const isExpanded = ref(false)

const shouldExpand = computed(() => props.forceExpand || isExpanded.value)

const categoryIconComponent = computed(() => getIcon(props.category.icon || 'cat1'))

const displayName = computed(() =>
  budgetStore.getCategoryDisplayName(props.category, props.selectedDate)
)

const displayBudget = computed(() =>
  budgetStore.getCategoryDisplayBudget(props.category, props.selectedDate)
)

const categoryEntries = computed(() => {
  return budgetStore.filteredEntries.filter(
    e => e.budgetCategoryId === props.category.id
  )
})

const spent = computed(() => {
  return budgetStore.getCategorySpent(props.category.id)
})

const paidSpent = computed(() => {
  return budgetStore.getCategoryPaidSpent(props.category.id)
})

const available = computed(() => {
  return displayBudget.value - paidSpent.value
})

const progressPercentage = computed(() => {
  const percentage = (paidSpent.value / displayBudget.value) * 100
  return Math.min(percentage, 100)
})

const progressColor = computed(() => {
  return props.category.color || colorPrimary
})

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const handleEdit = () => {
  emit('edit', props.category)
}
</script>

<style scoped lang="scss">
.budget-category-item {
  background: $bg-item;
  border-radius: 16px;
  margin-bottom: 12px;
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

  &__left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  &__available {
    font-family: $font-medium;
    font-size: 14px;
    white-space: nowrap;
  }

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    :deep(svg) {
      width: 22px;
      height: 22px;
    }
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-family: "PoppinsMedium", serif !important;
    font-weight: normal !important;
    font-size: 15px;
    color: $text-dark;
    margin: 0 0 4px 0;
  }

  &__amount {
    font-family: $font;
    font-size: 13px;
    color: $text-gray-md;
    margin: 0;
  }

  &__progress {
    height: 6px;
    background: $bg-bar;
    margin: 0 16px 16px;
    border-radius: 3px;
    overflow: hidden;
  }

  &__progress-bar {
    height: 100%;
    transition: width 0.3s ease, background-color 0.3s ease;
    border-radius: 3px;
  }

  &__content {
    padding: 0 16px 16px;
  }

  &__empty {
    text-align: center;
    padding: 24px 16px;
    color: $text-gray-lg;
    font-size: 14px;
  }

  &__entries {
    margin-bottom: 16px;

    :deep(.budget-item) {
      background-color: $white;
    }
  }

  &__actions {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding-top: 16px;
    border-top: 1px solid $bg-general;

    button {
      width: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      line-height: 1;
      padding: 7px 30px 7px 16px !important;
      transform: translateX(-3px);
    }
  }
}

.btn-sm {
  font-size: 13px;
}
</style>