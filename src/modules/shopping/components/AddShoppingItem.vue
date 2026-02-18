<template>
  <v-dialog v-model="showDialog" max-width="400" persistent>
    <v-card class="item-dialog">
      <v-card-title class="item-dialog__title">
        {{ isEditing ? 'Editar' : 'Nuevo' }} artículo
      </v-card-title>
      <v-card-text class="item-dialog__content">
        <v-text-field
          v-model="form.name"
          label="Nombre*"
          density="comfortable"
          hide-details
          class="general-input mb-4"
        />
        <v-text-field
          v-model="formattedEstimatedAmount"
          @update:model-value="onInputEstimated"
          label="Monto estimado*"
          density="comfortable"
          hide-details
          prefix="$"
          class="general-input mb-4"
        />
        <v-text-field
          v-model="formattedRealAmount"
          @update:model-value="onInputReal"
          label="Monto real"
          density="comfortable"
          hide-details
          prefix="$"
          class="general-input"
        />
      </v-card-text>
      <v-card-actions class="item-dialog__actions">
        <v-btn
          v-if="isEditing"
          class="btn-label"
          color="error"
          @click="handleDelete"
        >
          Eliminar
        </v-btn>
        <v-spacer />
        <v-btn class="btn-label" @click="closeDialog">Cancelar</v-btn>
        <v-btn
          class="btn-label"
          :color="colorPrimary"
          @click="save"
          :disabled="!form.name || form.estimatedAmount === 0"
        >
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ShoppingItem } from '../shopping.interface'
import { colorPrimary, colorMdPrimary } from '@/styles/variables.styles'

interface Props {
  listId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  save: [item: ShoppingItem]
  delete: [itemId: string]
}>()

const showDialog = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const tooltipVisible = ref(false)
const isLongPress = ref(false)
let longPressResetTimeout: ReturnType<typeof setTimeout> | null = null
let longPressTimeout: ReturnType<typeof setTimeout> | null = null
let tooltipAutoHideTimeout: ReturnType<typeof setTimeout> | null = null

const form = ref({
  name: '',
  estimatedAmount: 0,
  realAmount: 0
})

const formattedEstimatedAmount = computed(() => {
  if (form.value.estimatedAmount === 0) return ''
  return form.value.estimatedAmount.toLocaleString('es-CO')
})

const formattedRealAmount = computed(() => {
  if (form.value.realAmount === 0) return ''
  return form.value.realAmount.toLocaleString('es-CO')
})

const onInputEstimated = (val: string) => {
  const numeric = Number(val.replace(/[^\d]/g, ''))
  form.value.estimatedAmount = isNaN(numeric) ? 0 : numeric
}

const onInputReal = (val: string) => {
  const numeric = Number(val.replace(/[^\d]/g, ''))
  form.value.realAmount = isNaN(numeric) ? 0 : numeric
}

const openDialog = () => {
  resetForm()
  isEditing.value = false
  showDialog.value = true
}

const openEditDialog = (item: ShoppingItem) => {
  form.value = {
    name: item.name,
    estimatedAmount: item.estimatedAmount,
    realAmount: item.realAmount
  }
  editingId.value = item.id
  isEditing.value = true
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  resetForm()
}

const resetForm = () => {
  form.value = {
    name: '',
    estimatedAmount: 0,
    realAmount: 0
  }
  editingId.value = null
  isEditing.value = false
}

const save = () => {
  if (!form.value.name || form.value.estimatedAmount === 0) {
    return
  }

  const item: ShoppingItem = {
    id: editingId.value || '',
    name: form.value.name,
    estimatedAmount: form.value.estimatedAmount,
    realAmount: form.value.realAmount,
    checked: false,
    converted: false,
    expenseId: null
  }

  emit('save', item)
  closeDialog()
}

const handleDelete = () => {
  if (editingId.value) {
    emit('delete', editingId.value)
    closeDialog()
  }
}

const showTooltip = (fromTouch = false) => {
  tooltipVisible.value = true
  if (fromTouch) {
    isLongPress.value = true
    if (tooltipAutoHideTimeout) {
      clearTimeout(tooltipAutoHideTimeout)
    }
    tooltipAutoHideTimeout = setTimeout(() => {
      hideTooltip()
    }, 1500)
  } else if (tooltipAutoHideTimeout) {
    clearTimeout(tooltipAutoHideTimeout)
  }
}

const hideTooltip = () => {
  tooltipVisible.value = false
  if (tooltipAutoHideTimeout) {
    clearTimeout(tooltipAutoHideTimeout)
  }
  if (longPressResetTimeout) {
    clearTimeout(longPressResetTimeout)
  }
  longPressResetTimeout = setTimeout(() => {
    isLongPress.value = false
  }, 300)
}

const startLongPress = () => {
  if (longPressTimeout) {
    clearTimeout(longPressTimeout)
  }
  longPressTimeout = setTimeout(() => {
    showTooltip(true)
  }, 500)
}

const endLongPress = () => {
  if (longPressTimeout) {
    clearTimeout(longPressTimeout)
  }
  if (isLongPress.value) {
    hideTooltip()
  }
}

const onPointerDown = (event: PointerEvent) => {
  if (event.pointerType === 'touch') {
    startLongPress()
  }
}

const onPointerEnter = (event: PointerEvent) => {
  if (event.pointerType === 'mouse') {
    showTooltip(false)
  }
}

const onPointerUp = (event: PointerEvent) => {
  if (event.pointerType === 'touch') {
    endLongPress()
  } else if (event.pointerType === 'mouse') {
    hideTooltip()
  }
}

const onPointerLeave = (event: PointerEvent) => {
  if (event.pointerType === 'mouse') {
    hideTooltip()
  } else if (event.pointerType === 'touch') {
    endLongPress()
  }
}

const handlePress = () => {
  if (isLongPress.value) {
    isLongPress.value = false
    return
  }
  openDialog()
}

defineExpose({
  openDialog,
  openEditDialog
})
</script>

<style scoped lang="scss">
.add-shopping-item {
  &__fab {
    position: fixed;
    bottom: 80px;
    right: 20px;
    z-index: 10;
    height: 40px !important;
    width: 40px !important;
    border-radius: 14px !important;

    @media (min-width: 960px) {
      bottom: 30px;
      right: 30px;
    }
  }
}

.item-dialog {
  background-color: $white;
  padding: 20px 10px 10px;
  box-shadow:
    0px 12px 32px rgba(0, 0, 0, 0.12),
    0px 2px 8px rgba(0, 0, 0, 0.06) !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
  border-radius: 32px !important;

  &__title {
    font-size: 1rem;
    font-family: $font-medium;
    padding: 0 24px 8px;
  }

  &__content {
    padding: 8px 24px !important;
  }

  &__actions {
    padding: 8px 24px 16px;
  }

  .btn-label {
    font-family: $font-medium;
  }
}
</style>
