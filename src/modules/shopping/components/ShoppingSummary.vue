<template>
  <div class="shopping-summary">
    <div class="shopping-summary__card">
      <div class="stat-content">
        <div class="stat-label">Listas activas</div>
        <div class="stat-value">{{ unconvertedCount }}</div>
      </div>
    </div>
    <div class="shopping-summary__card">
      <div class="stat-content">
        <div class="stat-label">Total items</div>
        <div class="stat-value">{{ totalItems }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  unconvertedCount: number
  totalItems: number
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.shopping-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;

  @media (min-width: 960px) {
    display: flex;
    gap: 25px;
    flex-direction: column;
  }

  &__card {
    background: $color-secondary !important;
    border-radius: 24px;

    .stat-content {
      padding: 16px 20px 16px 25px;

      @media (min-width: 960px) {
        padding: 20px 20px 20px 25px;
      }
    }

    .stat-label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.9);
    }

    .stat-value {
      font-size: 18px;
      font-family: $font-medium;
      color: white;
    }
  }
}
</style>
