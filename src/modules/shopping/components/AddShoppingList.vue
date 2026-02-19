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

    <SideDrawer
      v-model="showDialog"
      :title="isEditing ? 'Editar lista' : 'Nueva lista de compras'"
      :width="380"
      persistent
      @update:model-value="
        val => {
          if (!val) closeDialog()
        }
      "
    >
      <div class="side-drawer-body">
        <div class="side-drawer-body__content">
          <v-text-field
            v-model="form.name"
            label="Nombre de la lista*"
            density="comfortable"
            hide-details
            class="general-input mb-4"
          />
        </div>
        <div class="side-drawer-body__actions">
          <v-spacer />
          <v-btn class="btn-neutro" @click="closeDialog">Cancelar</v-btn>
          <v-btn class="btn-primary" @click="save" :disabled="!form.name">
            Guardar
          </v-btn>
        </div>
      </div>
    </SideDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SideDrawer from '@/modules/shared/components/SideDrawer.vue'
import { useShoppingStore } from '../shopping.store'
import type { ShoppingList } from '../shopping.interface'
import { generateId } from '@/modules/shared/utils'
import { useToastStore } from '@/modules/shared/toast/toast.store'
import { colorMdPrimary } from '@/styles/variables.styles'
import dayjs from 'dayjs'
import AddIcon from '@/assets/icons/Add.icon.vue'

interface Props {
  showFab?: boolean
}

withDefaults(defineProps<Props>(), {
  showFab: true
})

const shoppingStore = useShoppingStore()
const toast = useToastStore()

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
</style>
