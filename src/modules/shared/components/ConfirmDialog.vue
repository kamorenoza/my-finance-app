<!-- src/components/ConfirmDialog.vue -->
<template>
  <v-dialog v-model="visible" max-width="350">
    <v-card>
      <v-card-title class="general-title confirm-title">{{
        title
      }}</v-card-title>
      <v-card-text class="confirm-message" v-html="message" />
      <v-card-actions>
        <v-spacer />
        <v-btn class="btn-label" @click="onCancel">Cancelar</v-btn>
        <v-btn
          class="btn-label"
          :color="confirmColor || 'primary'"
          text
          @click="onConfirm"
        >
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  title: string
  message: string
  confirmColor?: string
  onConfirm: () => void
  onCancel: () => void
}>()

const visible = ref(true)

const onConfirm = () => {
  props.onConfirm()
  visible.value = false
}

const onCancel = () => {
  props.onCancel()
  visible.value = false
}
</script>

<style scoped lang="scss">
.confirm-title {
  padding: 16px 24px 8px;
}

.confirm-message {
  padding: 16px 24px 8px !important;
  font-size: 15px !important;
}
</style>
