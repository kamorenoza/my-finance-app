<template>
  <div class="sort-filter">
    <div class="sort-filter__search">
      <v-menu v-model="menu" :close-on-content-click="false">
        <template v-slot:activator="{ props }">
          <div class="sort-filter__icon" v-bind="props">
            <FilterIcon />
          </div>
        </template>
        <div class="sort-filter__filters">
          <v-select
            v-model="store.selectedType"
            :items="accountTypes"
            item-title="label"
            item-value="type"
            label="Filtro por tipo cuenta"
            :return-object="false"
            class="general-input"
            density="comfortable"
          ></v-select>

          <v-select
            v-model="store.sortBy"
            :items="ACCOUNTS_ORDER_BY"
            item-title="label"
            item-value="filter"
            label="Ordenar por"
            class="general-input"
            density="comfortable"
          />

          <div class="sort-filter__actions">
            <v-btn @click="menu = false" type="button" class="btn-label">
              Cerrar
            </v-btn>
            <v-btn @click="clearAll()" type="button" class="btn-label primary">
              Limpiar
            </v-btn>
          </div>
        </div>
      </v-menu>

      <v-text-field
        class="search-input"
        v-model="store.search"
        label="Buscar por nombre"
        density="compact"
      >
        <template v-slot:prepend>
          <SearchIcon />
        </template>
      </v-text-field>
    </div>
  </div>
</template>

<script setup lang="ts">
import FilterIcon from '@/assets/icons/Filter.icon.vue'
import { ACCOUNTS_ORDER_BY, ACCOUNTS_TYPES } from '../accounts.constants'
import { useAccountsStore } from '../accounts.store'
import { onMounted, ref } from 'vue'

onMounted(() => {
  store.clearFilters()
})

const store = useAccountsStore()
const accountTypes = [
  {
    type: 'all',
    label: 'Todos'
  },
  ...ACCOUNTS_TYPES
]
const menu = ref(false)

const clearAll = () => {
  store.clearFilters()
  menu.value = false
}
</script>

<style scoped lang="scss">
.sort-filter {
  padding: 0 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 10px;

  @media (min-width: 960px) {
    padding-left: 0;
    gap: 0;
  }

  &__view {
    display: flex;
    gap: 4px;

    @media (min-width: 601px) {
      display: none;
    }
  }

  &__icon {
    height: 40px;
    width: 40px;
    background-color: $bg-general;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    cursor: pointer;

    .icon {
      width: 25px;
    }

    &.active {
      background-color: $color-primary;
    }
  }

  &__search {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__filters {
    background-color: $white;
    padding: 20px 20px 0;
    width: 300px;
    box-shadow:
      0px 12px 32px rgba(0, 0, 0, 0.12),
      0px 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 24px;
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: end;
    margin-bottom: 10px;
  }
}

:deep(.sort-filter .v-input__prepend) {
  background: $bg-general;
}
</style>
