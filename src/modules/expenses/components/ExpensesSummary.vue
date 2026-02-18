<template>
  <div class="expenses-summary">
    <div class="text-center">
      <div class="expenses-summary__label">Total Gastos</div>
      <div class="expenses-summary__amount">
        {{ formattedTotal }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  total: number
}

const props = defineProps<Props>()

const formattedTotal = computed(() => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(props.total)
})
</script>

<style lang="scss" scoped>
.expenses-summary {
  border-radius: 24px;
  background: $blue !important;
  padding: 20px 0;

  &__label {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    letter-spacing: 0.5px;
  }

  &__amount {
    font-size: 22px;
    font-family: $font-medium;
    color: white;
    padding-right: 10px;
  }
}
</style>
