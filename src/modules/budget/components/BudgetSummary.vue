<template>
  <div class="budget-summary">
    <v-row class="summary-wrapper" dense>
      <v-col cols="4" sm="4">
        <v-card class="summary-card income" flat>
          <div class="card-content">
            <div class="d-flex">
              <v-icon size="20" class="icon" color="#388e3c">
                mdi-cash-plus
              </v-icon>
              <div class="label">Ingresos</div>
            </div>
            <div>
              <div class="amount">{{ currency(totalIncomes) }}</div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="4" sm="4">
        <v-card class="summary-card expense" flat>
          <div class="card-content">
            <div class="d-flex">
              <v-icon size="20" class="icon" color="#d32f2f">
                mdi-cash-minus
              </v-icon>
              <div class="label">Gastos</div>
            </div>
            <div>
              <div class="amount">{{ currency(totalExpenses) }}</div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="4" sm="4">
        <v-card class="summary-card balance" flat>
          <div class="card-content">
            <div class="d-flex align-center">
              <v-icon size="17" class="icon" color="#1976d2">
                mdi-scale-balance
              </v-icon>
              <div class="label">Balance</div>
            </div>
            <div>
              <div class="amount">{{ currency(balance) }}</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
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
.summary-wrapper {
  margin: 5px;
}

.summary-card {
  border-radius: 4px;
  padding: 5px 5px 5px 7px;
  background-color: $color-white;

  @media (min-width: 960px) {
    width: 120px;
  }

  .card-content {
    .icon {
      font-size: 32px;
      margin-right: 5px;
    }

    .label {
      font-size: 13px;
      font-weight: 500;
      color: $text-gray-2;
    }

    .amount {
      font-size: 13px;
      font-weight: 600;
    }
  }

  &.income {
    border-top: 4px solid #a5d6a7;
  }

  &.expense {
    border-top: 4px solid #ef9a9a;
  }

  &.balance {
    border-top: 4px solid #90caf9;
  }
}
</style>
