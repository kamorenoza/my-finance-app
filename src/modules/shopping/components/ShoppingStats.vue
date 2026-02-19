<template>
  <div class="shopping-stats">
    <div class="stat-item">
      <div class="stat-body items">
        <span class="stat-label">Items</span>
        <span class="stat-value">{{ totalItems }}</span>
      </div>

      <div class="stat-body">
        <span class="stat-label">Total</span>
        <span class="stat-value">{{ currency(totalList) }}</span>
      </div>
    </div>
    <div class="stat-item">
      <div class="stat-body items">
        <span class="stat-label">Completados</span>
        <span class="stat-value">{{ completedCount }}</span>
      </div>

      <div class="stat-body">
        <span class="stat-label">Total</span>
        <span class="stat-value">{{ currency(totalCompleted) }}</span>
      </div>
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
  padding: 20px 15px 15px;

  @media (min-width: 960px) {
    display: flex;
    flex-direction: column;
    width: 250px;
    gap: 20px;
  }

  .stat-item {
    background: rgba($color-md-secondary, 0.15);
    border-radius: 18px;
    padding: 16px;
  }

  .stat-body {
    display: flex;
    flex-direction: column;

    &.items {
      margin-bottom: 15px;
      flex-direction: row;
      align-items: center;
      gap: 6px;
    }
  }

  .stat-label {
    font-size: 0.7rem;
    color: $text-gray-md;
    letter-spacing: 0.2px;
    padding-bottom: 2px;
  }

  .items .stat-label {
    padding-bottom: 0;
  }

  .stat-value {
    font-size: 0.9rem;
    font-family: $font-medium;
    color: $color-secondary;
    line-height: 1rem;
  }
}
</style>
