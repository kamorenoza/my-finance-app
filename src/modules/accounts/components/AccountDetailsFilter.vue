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

          <p>Filtrar por fechas</p>
          <DateSelector v-model="initDate" :empty-date="true" />
          <DateSelector v-model="endDate" :empty-date="true" />

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

      <AddAccountExpenseMore :account-id="accountId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import FilterIcon from '@/assets/icons/Filter.icon.vue'
import SearchIcon from '@/assets/icons/Search.icon.vue'
import { ref, watch, onMounted } from 'vue'
import { configService } from '@/modules/accounts/config.service'
import AddAccountExpenseMore from './AddAccountExpenseMore.vue'
import DateSelector from '@/modules/shared/components/DateSelector.vue'

interface Props {
  accountId: string
  initialGroupBy?: string | null
  initialOrderBy?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  initialGroupBy: 'category',
  initialOrderBy: null
})

const menu = ref(false)
const search = ref('')
const selectedType = ref<string | null>(props.initialGroupBy)
const sortBy = ref<string | null>(props.initialOrderBy)
const initDate = ref<any>(null)
const endDate = ref<any>(null)

// Load configuration when component mounts
onMounted(() => {
  const savedConfig = configService.getAccountConfig(props.accountId)
  if (savedConfig.groupBy !== undefined) {
    selectedType.value = savedConfig.groupBy
  }
  if (savedConfig.orderBy !== undefined) {
    sortBy.value = savedConfig.orderBy
  }
})
const emit = defineEmits<{
  (
    e: 'filterChange',
    filter: {
      search: string
      groupBy: string | null
      orderBy: string | null
      initDate?: Date | null
      endDate?: Date | null
    }
  ): void
}>()

const groupByOptions = [
  { label: 'No agrupar', type: 'none' },
  { label: 'Ingreso/Gasto', type: 'type' },
  { label: 'Categoría', type: 'category' },
  { label: 'Fecha', type: 'date' }
]

const orderByOptions = [
  { label: 'Más reciente', filter: 'newest' },
  { label: 'Más antiguo', filter: 'oldest' },
  { label: 'Mayor monto', filter: 'highest' },
  { label: 'Menor monto', filter: 'lowest' }
]

const clearAll = () => {
  menu.value = false
  search.value = ''
  selectedType.value = 'category'
  sortBy.value = null
  initDate.value = null
  endDate.value = null
}

watch([search, selectedType, sortBy, initDate, endDate], () => {
  // Emit filter change event
  const filter = {
    search: search.value,
    groupBy: selectedType.value,
    orderBy: sortBy.value,
    initDate: initDate.value,
    endDate: endDate.value
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
