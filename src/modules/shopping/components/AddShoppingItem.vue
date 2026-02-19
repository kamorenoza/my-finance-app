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
          v-model="formattedAmount"
          @update:model-value="onInputAmount"
          label="Monto*"
          density="comfortable"
          hide-details
          prefix="$"
          class="general-input"
        />
      </v-card-text>
      <v-card-actions class="item-dialog__actions">
        <v-btn class="btn-label" @click="closeDialog">Cancelar</v-btn>
        <v-btn
          class="btn-label"
          :color="colorPrimary"
          @click="save"
          :disabled="!form.name || form.amount === 0"
        >
          Guardar
        </v-btn>
      </v-card-actions>
      <div v-if="isEditing" class="item-dialog__delete">
        <v-btn
          class="btn-label item-dialog__delete-btn"
          variant="text"
          color="error"
          @click="handleDelete"
        >
          Eliminar artículo
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ShoppingItem } from '../shopping.interface'
import { colorPrimary } from '@/styles/variables.styles'
import { useConfirm } from '@/modules/shared/composables/useConfirm'

interface Props {
  listId: string
}

defineProps<Props>()

const confirm = useConfirm()

const emit = defineEmits<{
  save: [item: ShoppingItem]
  delete: [itemId: string]
}>()

const showDialog = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)

const form = ref({
  name: '',
  amount: 0
})

const formattedAmount = computed(() => {
  if (!form.value.amount || form.value.amount === 0) return ''
  return form.value.amount.toLocaleString('es-CO')
})

const onInputAmount = (val: string) => {
  const numeric = Number(val.replace(/[^\d]/g, ''))
  form.value.amount = isNaN(numeric) ? 0 : numeric
}

const openDialog = () => {
  resetForm()
  isEditing.value = false
  showDialog.value = true
}

const openEditDialog = (item: ShoppingItem) => {
  const legacyItem = item as any
  form.value = {
    name: item.name,
    amount: item.amount ?? legacyItem.estimatedAmount ?? 0
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
    amount: 0
  }
  editingId.value = null
  isEditing.value = false
}

const save = () => {
  if (!form.value.name || form.value.amount === 0) {
    return
  }

  const item: ShoppingItem = {
    id: editingId.value || '',
    name: form.value.name,
    amount: form.value.amount,
    checked: false,
    converted: false,
    expenseId: null
  }

  emit('save', item)
  closeDialog()
}

const handleDelete = async () => {
  if (editingId.value) {
    const confirmed = await confirm({
      title: 'Eliminar artículo',
      message: `¿Estás seguro de que deseas eliminar <strong>${form.value.name}</strong>?`,
      confirmColor: 'red'
    })
    if (confirmed) {
      emit('delete', editingId.value)
      closeDialog()
    }
  }
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
    padding: 8px 24px 8px;
    justify-content: flex-end;
  }

  &__delete {
    display: flex;
    justify-content: center;
    padding: 10px 24px 0px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    margin-top: 4px;
  }

  &__delete-btn {
    text-transform: none;

    :deep(.v-btn__content) {
      font-size: 0.9rem !important;
    }
  }

  .btn-label {
    font-family: $font-medium;
  }
}
</style>
