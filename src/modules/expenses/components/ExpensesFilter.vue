<template>
  <div class="search-filter">
    <div class="search-filter__search">
      <v-menu v-model="menu" :close-on-content-click="false">
        <template v-slot:activator="{ props }">
          <div class="search-filter__icon" v-bind="props">
            <FilterIcon />
          </div>
        </template>
        <div class="search-filter__filters">
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

          <div class="search-filter__actions">
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
        :label="searchLabel"
        density="compact"
      >
        <template v-slot:prepend>
          <SearchIcon />
        </template>
      </v-text-field>

      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import FilterIcon from '@/assets/icons/Filter.icon.vue'
import SearchIcon from '@/assets/icons/Search.icon.vue'
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useExpensesStore } from '@/modules/expenses/expenses.store'

interface GroupByOption {
  label: string
  type: string
}

interface OrderByOption {
  label: string
  filter: string
}

interface Props {
  initialGroupBy?: string | null
  initialOrderBy?: string | null
  searchLabel?: string
}

const groupByOptions: GroupByOption[] = [
  { label: 'No agrupar', type: 'none' },
  { label: 'Cuenta', type: 'account' },
  { label: 'Fecha', type: 'date' }
]

const orderByOptions: OrderByOption[] = [
  { label: 'Más reciente', filter: 'newest' },
  { label: 'Más antiguo', filter: 'oldest' },
  { label: 'Mayor monto', filter: 'highest' },
  { label: 'Menor monto', filter: 'lowest' }
]

const props = withDefaults(defineProps<Props>(), {
  searchLabel: 'Buscar por nombre'
})

const emit = defineEmits<{
  (
    e: 'filterChange',
    filter: {
      search: string
      groupBy: string | null
      orderBy: string | null
    }
  ): void
}>()

const expensesStore = useExpensesStore()

const menu = ref(false)
const search = ref('')
const selectedType = ref<string | null>(
  expensesStore.filterConfig.groupBy || 'date'
)
const sortBy = ref<string | null>(
  expensesStore.filterConfig.orderBy || 'newest'
)
const screenWidth = ref(window.innerWidth)

onMounted(() => {
  window.addEventListener('resize', updateSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateSize)
})

// Sincronizar estado local con props iniciales cuando cambien
watch(
  () => expensesStore.filterConfig.groupBy,
  newVal => {
    if (newVal !== undefined) {
      selectedType.value = newVal
    }
  }
)

watch(
  () => expensesStore.filterConfig.orderBy,
  newVal => {
    if (newVal !== undefined) {
      sortBy.value = newVal
    }
  }
)

const updateSize = () => {
  screenWidth.value = window.innerWidth
}

const clearAll = () => {
  menu.value = false
  search.value = ''
  selectedType.value = 'date'
  sortBy.value = 'newest'
}

watch([search, selectedType, sortBy], () => {
  // Emit filter change event
  const filter = {
    search: search.value,
    groupBy: selectedType.value,
    orderBy: sortBy.value
  }
  emit('filterChange', filter)

  // Save configuration to store
  if (selectedType.value || sortBy.value) {
    expensesStore.setFilterConfiguration(selectedType.value, sortBy.value)
  }
})
</script>

<style scoped lang="scss">
.search-filter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin: 20px 15px;

  @media (min-width: 960px) {
    padding-left: 0;
    gap: 0;
    padding-right: 15px;
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
    margin-top: 20px;
  }
}

:deep(.search-input .v-input__prepend) {
  background: $bg-general;
}
</style>
