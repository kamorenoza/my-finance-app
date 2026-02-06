<template>
  <div class="date-selector">
    <v-btn
      class="date-selector__arrow"
      @click="previousMonth"
      variant="text"
      :color="colorPrimary"
    >
      <v-icon size="24">mdi-chevron-left</v-icon>
    </v-btn>

    <span @click="showPicker = true" class="date-selector__date no-effects">
      {{ formattedDate }}
    </span>

    <v-btn
      class="date-selector__arrow"
      @click="nextMonth"
      variant="text"
      :color="colorPrimary"
    >
      <v-icon size="24">mdi-chevron-right</v-icon>
    </v-btn>
  </div>

  <v-dialog v-model="showPicker" width="300">
    <v-card class="pa-4 pb-0">
      <p class="pb-6 text-medium">Seleccionar fecha</p>
      <v-row dense>
        <v-col cols="6">
          <v-select
            v-model="selectedMonth"
            :items="months"
            label="Mes"
            density="comfortable"
            hide-details
            variant="outlined"
            menu-icon=""
          >
            <template #append-inner />
          </v-select>
        </v-col>
        <v-col cols="6">
          <v-select
            v-model="selectedYear"
            :items="years"
            label="Año"
            density="comfortable"
            hide-details
            variant="outlined"
            menu-icon=""
          >
            <template #append-inner />
          </v-select>
        </v-col>
      </v-row>
      <div
        class="sub-label d-flex align-center justify-center"
        @click="goToCurrentMonth"
      >
        <v-icon size="18" color="primary" class="mr-1"
          >mdi-calendar-month</v-icon
        >
        <span>Seleccionar mes actual</span>
      </div>
      <v-card-actions class="justify-end">
        <v-btn class="picker-btn" @click="showPicker = false">Cancelar</v-btn>
        <v-btn class="picker-btn pr-0" color="primary" @click="applySelection">
          Aceptar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDisplay } from 'vuetify'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import { colorPrimary } from '@/styles/variables.styles'

const emit = defineEmits(['update:modelValue'])

const props = defineProps<{
  modelValue: Date
}>()

const internalDate = ref(new Date(props.modelValue))
const showPicker = ref(false)

const selectedMonth: any = ref(internalDate.value.getMonth())
const selectedYear = ref(internalDate.value.getFullYear())

const { mdAndUp } = useDisplay()
const isDesktop = computed(() => mdAndUp.value)

watch(
  () => props.modelValue,
  newVal => {
    internalDate.value = new Date(newVal)
    selectedMonth.value = internalDate.value.getMonth()
    selectedYear.value = internalDate.value.getFullYear()
  }
)

const formattedDate = computed(() => {
  const date = dayjs(internalDate.value).locale('es')
  const shortMonth = date.format('MMM')
  const year = date.format('YYYY')
  return `${shortMonth.charAt(0).toUpperCase() + shortMonth.slice(1)} ${year}`
})

const months = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
].map((name, index) => ({ title: name, value: index }))

const years = Array.from(
  { length: 20 },
  (_, i) => new Date().getFullYear() - 10 + i
)

const previousMonth = () => {
  internalDate.value = dayjs(internalDate.value).subtract(1, 'month').toDate()
  emit('update:modelValue', internalDate.value)
}

const nextMonth = () => {
  internalDate.value = dayjs(internalDate.value).add(1, 'month').toDate()
  emit('update:modelValue', internalDate.value)
}

const applySelection = () => {
  internalDate.value = new Date(selectedYear.value, selectedMonth.value, 1)
  emit('update:modelValue', internalDate.value)
  showPicker.value = false
}

const goToCurrentMonth = () => {
  const now = dayjs().startOf('month').toDate()
  selectedMonth.value = now
  showPicker.value = false
  emit('update:modelValue', now)
}
</script>

<style scoped lang="scss">
.date-selector {
  background-color: $color-md-primary;
  border-radius: 24px;
  display: flex;
  align-items: center;
  height: 40px;

  &__date {
    font-size: 0.9rem;
    line-height: 0.9rem;
    width: 85px;
    display: flex;
    justify-content: center;
  }

  &__arrow {
    height: 40px;
    padding: 0;
    width: 40px !important;
    min-width: 0;
    border-radius: 100%;

    &:visited,
    &:active {
      background: none !important;
    }
  }
}

.month-year-selector {
  background: $color-primary;
  padding: 20px 8px 15px;
  width: 161px;

  .v-btn {
    text-transform: none;
    font-weight: 400;
    font-size: 16px;
  }

  .v-icon {
    color: $color-white;
  }
}

.picker-btn {
  text-transform: none;
  font-size: 15px;
  letter-spacing: normal;
}

.sub-label {
  font-size: 15px;
  font-weight: 500;
  color: $color-primary;
  margin-bottom: 8px;
  padding-top: 10px;
  cursor: pointer;
}

.month-title {
  cursor: pointer;
  color: $color-white;
  font-weight: 400;
}

.desktop-date-picker {
  background: rgba($color-primary, 0.9);
  .v-btn {
    text-transform: none;
    font-weight: 400;
    font-size: 14px;
    color: $color-white;
  }

  .date-button {
    min-width: 130px;
    justify-content: center;
  }
}

:deep(.v-ripple__container) {
  display: none !important;
  opacity: 0 !important;
}
</style>
