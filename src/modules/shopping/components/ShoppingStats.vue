<template>
  <div class="shopping-stats">
    <div class="stat-item">
      <span class="stat-label">Items</span>
      <span class="stat-value">{{ totalItems }}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Completados</span>
      <span class="stat-value">{{ completedCount }}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Total lista</span>
      <span class="stat-value">{{ currency(totalList) }}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Total completados</span>
      <span class="stat-value">{{ currency(totalCompleted) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  totalItems: number
  completedCount: number
  totalList: number
  totalCompleted: number
}

defineProps<Props>()

const currency = (value: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value)
</script>

<style scoped lang="scss">
.shopping-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 25px 15px;

  @media (min-width: 600px) {
    display: flex;
    flex-direction: column;
    width: 250px;
    gap: 20px;
  }

  .stat-item {
    background: rgba($color-md-secondary, 0.15);
    border-radius: 18px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .stat-label {
    font-size: 0.75rem;
    color: $text-gray-md;
    letter-spacing: 0.2px;
  }

  .stat-value {
    font-size: 1.1rem;
    font-family: $font-medium;
    color: $color-secondary;
  }
}
</style>
