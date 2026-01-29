<template>
  <div class="accounts">
    <div class="general-header">
      <p class="general-title">Mis cuentas</p>
      <AddAccount />
    </div>

    <div>
      <SortFilter />
      <CardCarousel />
    </div>
  </div>
</template>

<script setup lang="ts">
import AddAccount from './components/AddAccount.vue'
import CardCarousel from './components/CardCarousel.vue'
import SortFilter from './components/SortFilter.vue'
import { usePreventBack } from '@/modules/shared/composables/usePreventBack'

// Prevenir que el usuario pueda ir atrás desde esta ruta
usePreventBack()
</script>

<style scoped lang="scss">
.accounts {
  padding-left: 0;

  @media (min-width: 960px) {
    padding-left: 20px;
  }
}
</style>
