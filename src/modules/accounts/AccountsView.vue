<template>
  <div class="accounts">
    <PageHeader title="Mis cuentas">
      <template #actions>
        <CategoryManager />
      </template>
    </PageHeader>

    <div>
      <div class="accounts__bar">
        <SortFilter />
        <AddAccount />
      </div>

      <CardCarousel />
    </div>
  </div>
</template>

<script setup lang="ts">
import CategoryManager from '../categories/CategoryManager.vue'
import PageHeader from '../shared/components/PageHeader.vue'
import { configService } from '../shared/services/config.service'
import AddAccount from './components/AddAccount.vue'
import CardCarousel from './components/CardCarousel.vue'
import SortFilter from './components/SortFilter.vue'
import { usePreventBack } from '@/modules/shared/composables/usePreventBack'

configService.saveLastPage('/cuentas')

// Prevenir que el usuario pueda ir atrás desde esta ruta
usePreventBack()
</script>

<style scoped lang="scss">
.accounts {
  padding-left: 0;

  @media (min-width: 960px) {
    padding-left: 20px;
  }

  &__bar {
    display: flex;
    padding: 0 15px;
    gap: 10px;

    @media (min-width: 960px) {
      padding: 0;
    }
  }
}
</style>
