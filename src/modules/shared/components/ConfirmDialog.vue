<!-- src/components/ConfirmDialog.vue -->
<template>
  <v-dialog v-model="visible" max-width="350">
    <v-card class="confirm-dialog">
      <v-card-title class="general-title confirm-title">{{
        title
      }}</v-card-title>
      <v-card-text class="confirm-message" v-html="message" />
      <v-card-actions>
        <v-spacer />
        <v-btn class="btn-label" @click="onCancel">{{
          cancelText || 'Cancelar'
        }}</v-btn>
        <v-btn
          class="btn-label"
          :color="confirmColor || colorPrimary"
          text
          @click="onConfirm"
        >
          {{ confirmText || 'Confirmar' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { colorPrimary } from '@/styles/variables.styles'
import { ref } from 'vue'

const props = defineProps<{
  title: string
  message: string
  confirmColor?: string
  confirmText?: string
  cancelText?: string
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
  padding-left: 24px;
}

.confirm-message {
  padding: 16px 24px 8px !important;
  font-size: 15px !important;
}
.confirm-dialog {
  background-color: $white;
  padding: 20px 10px 10px;
  box-shadow:
    0px 12px 32px rgba(0, 0, 0, 0.12),
    0px 2px 8px rgba(0, 0, 0, 0.06) !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
  border-radius: 32px !important;

  .btn-label {
    font-family: $font-medium;
  }
}
</style>
