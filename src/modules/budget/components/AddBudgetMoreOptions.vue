<template>
  <v-menu v-model="menu" location="top end" :close-on-content-click="false">
    <template #activator="{ props }">
      <v-btn
        icon
        variant="plain"
        v-bind="props"
        :ripple="false"
        class="btn-label add-budget__button"
      >
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </template>

    <v-card width="280" class="pa-3 d-flex flex-column gap-2">
      <v-switch
        v-model="localEntry.isFixed"
        label="Fijo"
        inset
        density="comfortable"
        hide-details
        :color="localEntry.isFixed ? 'success' : undefined"
        class="ma-0 pa-0"
        @change="updateEntry"
      />

      <v-text-field
        ref="repeatInput"
        v-model="localRepeat"
        type="text"
        label="Repetir"
        density="compact"
        hide-details
        @input="onlyNumbers"
        inputmode="numeric"
        pattern="[0-9]*"
        maxlength="3"
        @focus="scrollIntoView"
        @change="updateEntry"
      >
        <template #append-inner>
          <span class="text-grey-darken-1 text-caption">meses</span>
        </template>
      </v-text-field>

      <v-text-field
        v-model="localDate"
        label="Fecha"
        type="date"
        density="compact"
        hide-details
        @change="updateEntry"
      ></v-text-field>
    </v-card>
  </v-menu>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const menu = ref(false)
const localEntry = ref({
  isFixed: props.modelValue.isFixed
})
const localRepeat = ref(
  props.modelValue.repeat === 0 ? '' : props.modelValue.repeat
)
const localDate = ref(props.modelValue.date || '')

const onlyNumbers = event => {
  const value = event.target.value
  if (!/^\d+$/.test(value)) {
    event.target.value = value.slice(0, -1)
  }
}

const updateEntry = () => {
  emit('update:modelValue', {
    ...localEntry.value,
    isFixed: localEntry.value.isFixed,
    repeat: localRepeat.value,
    date: localDate.value
  })
}

const scrollIntoView = () => {
  const element = document.getElementById('repeatInput')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

watch(
  () => props.modelValue,
  newVal => {
    localEntry.value = newVal
    localEntry.value.isFixed = newVal.isFixed
    localRepeat.value = newVal.repeat
    localDate.value = newVal.date || ''
  },
  { deep: true }
)
</script>

<style scoped lang="scss">
.add-budget__button {
  width: 20px;
  padding-left: 10px;

  @media (min-width: 960px) {
    width: 40px;
  }
}
</style>
