<template>
  <div class="account-preview__header">
    <p class="subtitle">Movimientos</p>
    <p class="more">Ver más</p>
  </div>
  <AddAccountExpense />
</template>

<script setup lang="ts">
import AddAccountExpense from './AddAccountExpense.vue'
</script>

<style scoped lang="scss">
.account-preview {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .more {
      font-size: 14px;
      font-family: $font-medium;
      color: $purple;
    }
  }
}
</style>
