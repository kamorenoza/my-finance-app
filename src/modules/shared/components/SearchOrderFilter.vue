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

          <p v-if="!props.hideDateFilter">Filtrar por fechas</p>
          <div class="mt-3 mb-3" v-if="!props.hideDateFilter">
            <DateSelector v-model="initDate" :empty-date="true" />
          </div>

          <DateSelector
            v-model="endDate"
            :empty-date="true"
            v-if="!props.hideDateFilter"
          />

          <div class="collapse-toggle">
            <v-switch
              v-model="collapseAll"
              label="Collapsar todo"
              inset
              density="compact"
              hide-details
              :color="collapseAll ? 'success' : undefined"
              class="ma-0 pa-0"
            />
          </div>

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
import { ref, watch, onMounted, computed, onUnmounted } from 'vue'
import DateSelector from '@/modules/shared/components/DateSelector.vue'

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
  groupByOptions?: GroupByOption[]
  orderByOptions?: OrderByOption[]
  searchLabel?: string
  entityId?: string | null
  hideDateFilter?: boolean
  initialCollapseAll?: boolean
}

const defaultGroupByOptions: GroupByOption[] = [
  { label: 'No agrupar', type: 'none' },
  { label: 'Ingreso/Gasto', type: 'type' },
  { label: 'Categoría', type: 'category' },
  { label: 'Fecha', type: 'date' }
]

const defaultOrderByOptions: OrderByOption[] = [
  { label: 'Más reciente', filter: 'newest' },
  { label: 'Más antiguo', filter: 'oldest' },
  { label: 'Mayor monto', filter: 'highest' },
  { label: 'Menor monto', filter: 'lowest' }
]

const props = withDefaults(defineProps<Props>(), {
  initialGroupBy: 'category',
  initialOrderBy: null,
  searchLabel: 'Buscar por nombre',
  entityId: null,
  initialCollapseAll: false
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
      collapseAll?: boolean
    }
  ): void
}>()

const menu = ref(false)
const search = ref('')
const selectedType = ref<string | null>(props.initialGroupBy)
const sortBy = ref<string | null>(props.initialOrderBy)
const initDate = ref<any>(null)
const endDate = ref<any>(null)
const collapseAll = ref(props.initialCollapseAll)
const screenWidth = ref(window.innerWidth)

const groupByOptions = computed(
  () => props.groupByOptions || defaultGroupByOptions
)
const orderByOptions = computed(
  () => props.orderByOptions || defaultOrderByOptions
)

onMounted(() => {
  window.addEventListener('resize', updateSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateSize)
})

// Sincronizar estado local con props iniciales cuando cambien
watch(
  () => props.initialGroupBy,
  newVal => {
    selectedType.value = newVal
  }
)

watch(
  () => props.initialOrderBy,
  newVal => {
    sortBy.value = newVal
  }
)

watch(
  () => props.initialCollapseAll,
  newVal => {
    collapseAll.value = newVal
  }
)

const updateSize = () => {
  screenWidth.value = window.innerWidth
}

const clearAll = () => {
  menu.value = false
  search.value = ''
  selectedType.value = props.initialGroupBy || 'category'
  sortBy.value = props.initialOrderBy || null
  initDate.value = null
  endDate.value = null
  collapseAll.value = false
}

watch([search, selectedType, sortBy, initDate, endDate, collapseAll], () => {
  // Emit filter change event
  const filter = {
    search: search.value,
    groupBy: selectedType.value,
    orderBy: sortBy.value,
    initDate: initDate.value,
    endDate: endDate.value,
    collapseAll: collapseAll.value
  }
  emit('filterChange', filter)
})
</script>

<style scoped lang="scss">
.search-filter {
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
