<template>
  <div class="budget-summary">
    <div class="budget-summary__card">
      <div class="budget-summary__header">
        <income-icon class="icon" />
        <div class="label">Ingresos</div>
      </div>
      <div class="budget-summary__section">
        <p class="budget-summary__label">Del mes</p>
        <p class="budget-summary__amount">{{ currency(totalIncome) }}</p>
      </div>
    </div>

    <div class="budget-summary__card expense">
      <div class="budget-summary__header">
        <expense-icon class="icon" />
        <div class="label">Gastos</div>
      </div>
      <div class="budget-summary__section">
        <p class="budget-summary__label">Del mes</p>
        <p class="budget-summary__amount">{{ currency(totalExpenses) }}</p>
      </div>
    </div>

    <div class="budget-summary__card balance">
      <div class="budget-summary__header">
        <balance-icon class="icon" />
        <div class="label">Balance</div>
      </div>
      <div class="budget-summary__section">
        <p class="budget-summary__label">Disponible</p>
        <p class="budget-summary__amount">{{ currency(balance) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBudgetStore } from '../budget.store'
import IncomeIcon from '@/assets/icons/Income.icon.vue'
import ExpenseIcon from '@/assets/icons/Expense.icon.vue'
import BalanceIcon from '@/assets/icons/Balance.icon.vue'

const budgetStore = useBudgetStore()

const totalIncome = computed(() => budgetStore.totalGeneralIncome)

const totalExpenses = computed(() => {
  return budgetStore.filteredEntries
    .filter(
      e =>
        e.type === 'gasto' &&
        budgetStore.getDisplayIsPaid(e, budgetStore.selectedDate)
    )
    .reduce(
      (sum, e) => sum + budgetStore.getDisplayValue(e, budgetStore.selectedDate),
      0
    )
})

const balance = computed(() => totalIncome.value - totalExpenses.value)

const currency = (value: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value)
</script>

<style scoped lang="scss">
.budget-summary {
  display: flex;
  align-items: stretch;
  gap: 6px;
  width: 100%;
  padding: 10px 15px 5px;

  @media (min-width: 960px) {
    flex-direction: column;
    gap: 15px;
    padding: 15px 15px 10px;
  }

  &__card {
    flex: 1;
    background-color: $green-md;
    border-radius: 24px;
    padding: 12px 15px;

    @media (min-width: 960px) {
      width: 250px;
      padding: 15px 15px 10px;
    }

    &.expense {
      background-color: $red-md;
    }

    &.balance {
      background-color: $blue-md;
    }

    .icon {
      width: 20px;
      height: 20px;

      @media (min-width: 960px) {
        width: 22px;
        height: 22px;
      }
    }
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.8rem;
    color: $text-gray;

    @media (min-width: 960px) {
      font-size: 0.9rem;
    }
  }

  &__section {
    background-color: transparent;

    @media (min-width: 960px) {
      background-color: $green-lg;
      padding: 10px 10px 8px;
      margin-top: 8px;
      border-radius: 12px;
    }
  }

  &__amount {
    font-family: $font-medium;
    font-size: 0.9rem;
    padding-top: 8px;
    padding-bottom: 3px;
    line-height: 1rem;

    @media (min-width: 960px) {
      padding-top: 4px;
    }
  }

  &__label {
    font-size: 0.7rem;
    line-height: 0.9rem;
    color: $text-gray;
    display: none;

    @media (min-width: 960px) {
      display: block;
    }
  }

  .expense {
    .budget-summary__section {
      @media (min-width: 960px) {
        background-color: $red-lg;
      }
    }
  }

  .balance {
    .budget-summary__section {
      @media (min-width: 960px) {
        background-color: $blue-lg;
      }
    }
  }
}
</style>