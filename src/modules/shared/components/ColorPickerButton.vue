<template>
  <div>
    <v-btn
      class="color-button"
      :style="{ 'background-color': selectedColor }"
      @click="showDialog = true"
    >
      +
    </v-btn>

    <v-dialog v-model="showDialog" persistent max-width="400px">
      <v-card>
        <p class="subtitle mt-3 ml-7">Seleccionar color</p>
        <v-card-text>
          <v-color-picker v-model="selectedColor" />
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="primary"
            class="btn-label ml-auto mr-3"
            @click="confirmColor"
          >
            Aceptar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import { watch } from 'vue'
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '#B0BEC5'
  }
})

const emit = defineEmits(['update:modelValue'])

const showDialog = ref(false)
const selectedColor = ref(props.modelValue)

watch(
  () => props.modelValue,
  newVal => {
    selectedColor.value = newVal
  }
)

const confirmColor = () => {
  emit('update:modelValue', selectedColor.value)
  showDialog.value = false
}
</script>

<style scoped lang="scss">
/* Estilos para el botón */
.v-btn {
  cursor: pointer;
  width: 40px;
  height: 40px;
}

.v-btn .v-icon {
  font-size: 24px;
}

.v-dialog .v-card {
  max-width: 350px;
}

.v-card-title {
  font-size: 18px;
  font-weight: bold;
}

.v-card-actions {
  display: flex;
  justify-content: space-between;
}

.color-button {
  border: none;
  box-shadow: none;
  min-width: 80px;
  width: 80px;
  min-height: 15px;
  height: 35px;
  padding: 0;
  border-radius: none;
}
</style>
