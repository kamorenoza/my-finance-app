<template>
  <SideDrawer
    v-model="drawer"
    :title="isEditing ? 'Editar categoría' : 'Agregar categoría'"
    persistent
    @update:model-value="
      val => {
        if (!val) closeDrawer()
      }
    "
  >
    <div class="side-drawer-body">
      <div class="side-drawer-body__content">
        <div class="add-category__row mb-5">
          <IconColorSelector
            :icon="categoryForm.icon"
            :backgroundColor="categoryForm.color"
            @done="onIconColorSelected"
          />
          <v-text-field
            v-model="categoryForm.name"
            class="general-input"
            density="comfortable"
            label="Nombre de la categoría*"
            hide-details
            type="text"
            maxlength="50"
            placeholder="Ej: Mercado, Casa, Transporte"
          />
        </div>

        <v-text-field
          class="general-input mb-5"
          density="comfortable"
          label="Presupuesto asignado*"
          hide-details
          prefix="$"
          :model-value="formattedAmount"
          @update:model-value="onInputAmount"
          maxlength="12"
          pattern="[0-9]*"
          inputmode="numeric"
        />
      </div>

      <div class="side-drawer-body__actions">
        <v-spacer />
        <v-btn type="button" class="btn-neutro" @click="closeDrawer">
          Cancelar
        </v-btn>
        <v-btn
          type="button"
          class="btn-primary"
          @click="handleSave"
          :disabled="!isValid"
        >
          {{ isEditing ? 'Actualizar' : 'Guardar' }}
        </v-btn>
      </div>

      <div class="add-budget__delete" v-if="isEditing">
        <p @click="handleDelete">Eliminar categoría</p>
      </div>
    </div>

    <ModificationChoiceDialog
      v-if="showModificationDialog"
      :entry-name="categoryForm.name"
      :reference-date="budgetStore.selectedDate"
      @chosen="handleModificationChoice"
      @cancelled="handleModificationCancel"
    />
  </SideDrawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SideDrawer from '@/modules/shared/components/SideDrawer.vue'
import IconColorSelector from '@/modules/categories/components/IconColorSelector.vue'
import ModificationChoiceDialog from './ModificationChoiceDialog.vue'
import { useBudgetStore } from '../budget.store'
import { generateId } from '@/modules/shared/utils'
import { colorPrimary } from '@/styles/variables.styles'
import type { BudgetCategory } from '../budget.interface'
import { useToastStore } from '@/modules/shared/toast/toast.store'
import { useConfirm } from '@/modules/shared/composables/useConfirm'

const drawer = ref(false)
const budgetStore = useBudgetStore()
const toastStore = useToastStore()
const confirm = useConfirm()

const categoryForm = ref({
  id: '',
  name: '',
  budgetedAmount: 0,
  color: colorPrimary,
  icon: 'cat1',
  order: 0
})

const isEditing = ref(false)
const showModificationDialog = ref(false)
const originalName = ref('')
const originalBudget = ref(0)

const formattedAmount = computed(() =>
  categoryForm.value.budgetedAmount
    ? new Intl.NumberFormat('es-CO').format(categoryForm.value.budgetedAmount)
    : ''
)

const onInputAmount = (value: string) => {
  const numeric = Number(String(value).replace(/\D/g, ''))
  categoryForm.value.budgetedAmount = isNaN(numeric) ? 0 : numeric
}

const isValid = computed(() => {
  return (
    categoryForm.value.name.trim() !== '' &&
    categoryForm.value.budgetedAmount > 0
  )
})

const openDrawer = (category?: BudgetCategory) => {
  if (category) {
    isEditing.value = true
    const displayName = budgetStore.getCategoryDisplayName(
      category,
      budgetStore.selectedDate
    )
    const displayBudget = budgetStore.getCategoryDisplayBudget(
      category,
      budgetStore.selectedDate
    )
    categoryForm.value = {
      id: category.id,
      name: displayName,
      budgetedAmount: displayBudget,
      color: category.color || colorPrimary,
      icon: category.icon || 'cat1',
      order: category.order || 0
    }
    originalName.value = displayName
    originalBudget.value = displayBudget
  } else {
    isEditing.value = false
    resetForm()
  }
  drawer.value = true
}

const closeDrawer = () => {
  drawer.value = false
  showModificationDialog.value = false
  resetForm()
}

const resetForm = () => {
  categoryForm.value = {
    id: '',
    name: '',
    budgetedAmount: 0,
    color: colorPrimary,
    icon: 'cat1',
    order: budgetStore.budgetCategories.length
  }
}

const onIconColorSelected = (data: { icon: string; backgroundColor: string }) => {
  categoryForm.value.icon = data.icon
  categoryForm.value.color = data.backgroundColor
}

const handleSave = () => {
  if (!isValid.value) return

  if (isEditing.value) {
    const nameChanged = categoryForm.value.name !== originalName.value
    const budgetChanged =
      categoryForm.value.budgetedAmount !== originalBudget.value

    if (nameChanged || budgetChanged) {
      // Preguntar el alcance del cambio (este mes / todos / de aquí en adelante)
      showModificationDialog.value = true
      return
    }

    // Solo cambios de color/icono: aplican a la categoría base
    budgetStore.updateBudgetCategory(categoryForm.value)
    toastStore.success('Categoría actualizada')
    closeDrawer()
    return
  }

  const newCategory: BudgetCategory = {
    ...categoryForm.value,
    id: generateId()
  }
  budgetStore.addBudgetCategory(newCategory)
  toastStore.success('Categoría creada')
  closeDrawer()
}

const handleModificationChoice = (scope: 'this' | 'all' | 'future') => {
  budgetStore.updateBudgetCategoryWithModification(categoryForm.value, scope)
  showModificationDialog.value = false
  toastStore.success('Categoría actualizada')
  closeDrawer()
}

const handleModificationCancel = () => {
  showModificationDialog.value = false
}

const handleDelete = async () => {
  const confirmed = await confirm({
    title: 'Eliminar categoría',
    message: `¿Estás seguro de eliminar "${categoryForm.value.name}"? Los movimientos quedarán en "Otros".`,
    confirmColor: 'red'
  })

  if (confirmed) {
    budgetStore.deleteBudgetCategory(categoryForm.value.id)
    toastStore.success('Categoría eliminada')
    closeDrawer()
  }
}

defineExpose({
  openDrawer
})
</script>

<style scoped lang="scss">
.add-category {
  &__row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

.add-budget {
  &__delete {
    padding: 20px 20px 0;
    font-size: 0.9rem;
    color: $color-red;
    text-align: right;
    font-family: $font-medium;
    cursor: pointer;
  }
}
</style>