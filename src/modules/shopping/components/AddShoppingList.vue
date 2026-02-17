<template>
  <div class="add-shopping">
    <v-tooltip
      v-if="showFab"
      v-model="tooltipVisible"
      text="Agregar lista"
      location="left"
      :open-on-hover="false"
      :open-on-focus="false"
      :open-on-click="false"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          :color="colorMdPrimary"
          class="btn-fab fab-button add-shopping__fab"
          @click="handlePress"
          @pointerdown="onPointerDown"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
          @pointerleave="onPointerLeave"
          @pointerenter="onPointerEnter"
          v-bind="props"
        >
          <add-icon class="icon" />
        </v-btn>
      </template>
    </v-tooltip>

    <v-dialog v-model="showDialog" max-width="400" persistent>
      <v-card class="shopping-dialog">
        <v-card-title class="shopping-dialog__title">
          {{ isEditing ? 'Editar' : 'Nueva' }} lista de compras
        </v-card-title>
        <v-card-text class="shopping-dialog__content">
          <v-text-field
            v-model="form.name"
            label="Nombre de la lista*"
            density="comfortable"
            hide-details
            class="general-input mb-4"
            autofocus
          />
        </v-card-text>
        <v-card-actions class="shopping-dialog__actions">
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
            :disabled="!form.name"
          >
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useShoppingStore } from '../shopping.store'
import type { ShoppingList } from '../shopping.interface'
import { generateId } from '@/modules/shared/utils'
import { useToastStore } from '@/modules/shared/toast/toast.store'
import { useConfirm } from '@/modules/shared/composables/useConfirm'
import { colorMdPrimary, colorPrimary } from '@/styles/variables.styles'
import dayjs from 'dayjs'
import AddIcon from '@/assets/icons/Add.icon.vue'

interface Props {
  showFab?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showFab: true
})

const shoppingStore = useShoppingStore()
const toast = useToastStore()
const confirm = useConfirm()

const showDialog = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const tooltipVisible = ref(false)
const isLongPress = ref(false)
let longPressResetTimeout: ReturnType<typeof setTimeout> | null = null
let longPressTimeout: ReturnType<typeof setTimeout> | null = null
let tooltipAutoHideTimeout: ReturnType<typeof setTimeout> | null = null

const form = ref({
  name: ''
})

const openDialog = () => {
  resetForm()
  isEditing.value = false
  showDialog.value = true
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

const openEditDialog = (list: ShoppingList) => {
  form.value = {
    name: list.name
  }
  editingId.value = list.id
  isEditing.value = true
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  resetForm()
}

const resetForm = () => {
  form.value = {
    name: ''
  }
  editingId.value = null
  isEditing.value = false
}

const save = () => {
  if (!form.value.name) {
    toast.error('Ingresa un nombre para la lista')
    return
  }

  if (isEditing.value && editingId.value) {
    const existingList = shoppingStore.shoppingLists.find(
      l => l.id === editingId.value
    )
    if (existingList) {
      shoppingStore.updateShoppingList({
        ...existingList,
        name: form.value.name
      })
      toast.success('Lista actualizada')
    }
  } else {
    const newList: ShoppingList = {
      id: generateId(),
      name: form.value.name,
      createdDate: dayjs().format('YYYY-MM-DD'),
      converted: false,
      expenseId: null,
      items: []
    }
    shoppingStore.addShoppingList(newList)
    toast.success('Lista creada')
  }

  closeDialog()
}

const handleDelete = async () => {
  if (!editingId.value) return

  const confirmed = await confirm({
    title: 'Eliminar lista',
    message: '¿Estás seguro de que deseas eliminar esta lista de compras?'
  })

  if (confirmed && editingId.value) {
    shoppingStore.deleteShoppingList(editingId.value)
    toast.success('Lista eliminada')
    closeDialog()
  }
}

defineExpose({
  openEditDialog
})
</script>

<style scoped lang="scss">
.add-shopping {
  &__fab {
    position: fixed;
    top: 5px;
    right: 15px;
    z-index: 10;
    height: 40px !important;
    width: 40px !important;
    border-radius: 14px !important;
    display: flex;
    align-items: center;

    @media (min-width: 960px) {
      bottom: 30px;
      right: 20px;
      top: 72px;
    }
  }
}

.shopping-dialog {
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
