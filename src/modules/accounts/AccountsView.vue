<template>
  <div class="general-header">
    <p class="general-title">Mis cuentas</p>
    <AddAccount />
  </div>

  <div>
    <SortFilter />
    <CardCarousel />
  </div>
</template>

<script setup lang="ts">
import AddAccount from './components/AddAccount.vue'
import CardCarousel from './components/CardCarousel.vue'
import SortFilter from './components/SortFilter.vue'
</script>
