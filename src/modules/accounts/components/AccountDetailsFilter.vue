<template>
  <div class="accounts-filter">
    <div class="accounts-filter__search">
      <v-menu v-model="menu" :close-on-content-click="false">
        <template v-slot:activator="{ props }">
          <div class="accounts-filter__icon" v-bind="props">
            <FilterIcon />
          </div>
        </template>
        <div class="accounts-filter__filters">
          <v-select
            v-model="selectedType"
            :items="groupByOptions"
            item-title="label"
            item-value="type"
            label="Agrupar por"
            :return-object="false"
            class="general-input"
            density="comfortable"
          ></v-select>

          <v-select
            v-model="sortBy"
            :items="orderByOptions"
            item-title="label"
            item-value="filter"
            label="Ordenar por"
            class="general-input"
            density="comfortable"
          />

          <div class="accounts-filter__actions">
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
        v-model="search"
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
import {  ref, watch } from 'vue'

const menu = ref(false)
const search = ref('')
const selectedType = ref<string | null>('category')
const sortBy = ref<string | null>(null)
const emit = defineEmits<{
  (e: 'filterChange', filter: { search: string; groupBy: string | null; orderBy: string | null }): void
}>()

const groupByOptions = [
  { label: 'Ingreso/Gasto', type: 'type' },
  { label: 'Categoría', type: 'category' },
  { label: 'Fecha', type: 'date' },
]

const orderByOptions = [
  { label: 'Más reciente', filter: 'newest' },
  { label: 'Más antiguo', filter: 'oldest' },
  { label: 'Mayor monto', filter: 'highest' },
  { label: 'Menor monto', filter: 'lowest' },
]

const clearAll = () => {
  menu.value = false
  search.value = ''
  selectedType.value = 'category'
  sortBy.value = null
}

watch([search, selectedType, sortBy], () => {
  // Emit filter change event
  const filter = {
    search: search.value,
    groupBy: selectedType.value,
    orderBy: sortBy.value,
  }
  emit('filterChange', filter)
})

</script>

<style scoped lang="scss">
.accounts-filter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 10px;
  width: 100%;

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
    background-color: $bg-input;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
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
    border-radius: 16px;
    box-shadow:
      rgba(9, 30, 66, 0.25) 0px 4px 8px -2px,
      rgba(9, 30, 66, 0.08) 0px 0px 0px 1px;
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: end;
    margin-bottom: 10px;
  }
}
</style>
