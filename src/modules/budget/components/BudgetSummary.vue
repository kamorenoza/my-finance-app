<template>
  <div class="budget-summary">
    <div class="budget-summary__card">
      <div class="budget-summary__header">
        <v-icon size="20" class="icon" color="#388e3c"> mdi-cash-plus </v-icon>
        <div class="label">Ingresos</div>
      </div>
      <div class="budget-summary__amount">{{ currency(totalIncomes) }}</div>
    </div>

    <div class="budget-summary__card expense">
      <div class="budget-summary__header">
        <v-icon size="20" class="icon" color="#388e3c"> mdi-cash-plus </v-icon>
        <div class="label">Gastos</div>
      </div>
      <div class="budget-summary__amount">{{ currency(totalExpenses) }}</div>
    </div>

    <div class="budget-summary__card balance">
      <div class="budget-summary__header">
        <v-icon size="20" class="icon" color="#388e3c"> mdi-cash-plus </v-icon>
        <div class="label">Balance</div>
      </div>
      <div class="budget-summary__amount">{{ currency(balance) }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useBudgetStore } from '../budget.store'

const store = useBudgetStore()

const totalIncomes = computed(() => store.totalIncomes)
const totalExpenses = computed(() => store.totalExpenses)
const balance = computed(() => totalIncomes.value - totalExpenses.value)

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
  padding: 20px 15px;

  @media (min-width: 960px) {
    flex-direction: column;
  }

  &__card {
    flex: 1;
    background-color: $green-md;
    border-radius: 24px;
    padding: 10px 15px;

    @media (min-width: 960px) {
      width: 150px;
    }

    &.expense {
      background-color: $red-md;
    }

    &.balance {
      background-color: $blue-md;
    }
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.8rem;
    color: $text-gray;
  }

  &__amount {
    font-family: $font-medium;
    font-size: 0.9rem;
    padding-top: 8px;
    padding-bottom: 3px;
  }
}
</style>
