<template>
  <div class="d-flex align-center ga-1 mt-3">
    <CalendarIcon @click="dialog = true" />

    <span @click="dialog = true" class="date-span cursor-pointer">
      {{ formattedDate }}
    </span>

    <v-dialog v-model="dialog" width="auto">
      <v-card>
        <v-date-picker v-model="selected" @update:modelValue="onDateChange" />
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import CalendarIcon from '@/assets/icons/Calendar.icon.vue'
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Date,
    default: null
  },
  emptyDate: Boolean
})
const emit = defineEmits(['update:modelValue', 'onChange'])

const dialog = ref(false)
const today = new Date()
const selected = ref<any>(props.emptyDate ? null : today)

onMounted(() => {
  // Sincronizar el estado inicial con el modelValue
  if (props.modelValue) {
    selected.value = new Date(props.modelValue)
  }
})

const onDateChange = (newDate: any) => {
  dialog.value = false
  selected.value = new Date(newDate)
  emit('update:modelValue', selected.value)
  emit('onChange', selected.value)
}

const formattedDate = computed(() => {
  if (!selected.value) return 'Seleccionar fecha'

  const date = new Date(selected.value)
  const day = date.getDate().toString().padStart(2, '0')
  const month = date.toLocaleDateString('es-ES', { month: 'long' })
  const year = date.getFullYear()
  return `${day} ${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`
})

watch(
  () => props.modelValue,
  newValue => {
    if (newValue) {
      selected.value = new Date(newValue)
    }
  }
)
</script>

<style scoped lang="scss">
.date-span {
  font-size: 14px;
  color: $text-gray-md;
  padding-top: 2px;
}
</style>
