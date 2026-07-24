<template>
  <SideDrawer
    v-model="drawer"
    :title="isEditing ? 'Editar ingreso' : 'Agregar ingreso del mes'"
    persistent
    @update:model-value="
      val => {
        if (!val) closeDrawer()
      }
    "
  >
    <div class="side-drawer-body">
      <div class="side-drawer-body__content">
        <v-text-field
          v-model="incomeForm.name"
          class="general-input mb-5"
          density="comfortable"
          label="Descripción*"
          hide-details
          type="text"
          maxlength="100"
          placeholder="Ej: Salario, Freelance"
        />

        <v-text-field
          class="general-input mb-5"
          density="comfortable"
          label="Valor*"
          hide-details
          prefix="$"
          :model-value="formattedValue"
          @update:model-value="onInputValue"
          maxlength="12"
          pattern="[0-9]*"
          inputmode="numeric"
        />

        <DateSelector v-model="incomeForm.date" />

        <v-switch
          v-model="incomeForm.isFixed"
          label="Ingreso fijo (se repite cada mes)"
          inset
          density="compact"
          hide-details
          :color="incomeForm.isFixed ? 'success' : undefined"
          class="ma-0 pa-0 mb-2 mt-4 subtitle"
        />

        <v-text-field
          v-if="!incomeForm.isFixed"
          class="general-input mb-2"
          density="comfortable"
          label="¿Cuántos meses se repite?"
          hide-details
          :model-value="formattedRepeat"
          @update:model-value="onInputRepeat"
          maxlength="3"
          pattern="[0-9]*"
          inputmode="numeric"
        />
        <p v-if="!incomeForm.isFixed" class="add-income__help">
          1 = solo este mes, 2 = dos meses, etc.
        </p>
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
      <div v-if="isEditing" class="add-income__delete">
        <v-btn
          type="button"
          class="btn-label"
          variant="text"
          color="error"
          @click="handleDelete"
        >
          Eliminar
        </v-btn>
      </div>
    </div>
  </SideDrawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SideDrawer from '@/modules/shared/components/SideDrawer.vue'
import DateSelector from '@/modules/shared/components/DateSelector.vue'
import { useBudgetStore } from '../budget.store'
import { generateId } from '@/modules/shared/utils'
import type { GeneralIncome } from '../budget.interface'
import { useToastStore } from '@/modules/shared/toast/toast.store'
import { useConfirm } from '@/modules/shared/composables/useConfirm'
import dayjs from 'dayjs'

const drawer = ref(false)
const budgetStore = useBudgetStore()
const toastStore = useToastStore()
const confirm = useConfirm()

const incomeForm = ref<{
  id: string
  name: string
  value: number
  date: Date
  isFixed: boolean
  repeat?: number
}>({
  id: '',
  name: '',
  value: 0,
  date: new Date(),
  isFixed: false,
  repeat: 1
})

const isEditing = ref(false)

const formattedValue = computed(() =>
  incomeForm.value.value
    ? new Intl.NumberFormat('es-CO').format(incomeForm.value.value)
    : ''
)

const formattedRepeat = computed(() =>
  incomeForm.value.repeat ? String(incomeForm.value.repeat) : ''
)

const onInputValue = (value: string) => {
  const numeric = Number(String(value).replace(/\D/g, ''))
  incomeForm.value.value = isNaN(numeric) ? 0 : numeric
}

const onInputRepeat = (value: string) => {
  const numeric = Number(String(value).replace(/\D/g, ''))
  incomeForm.value.repeat = isNaN(numeric) || numeric < 1 ? 1 : numeric
}

const isValid = computed(() => {
  return incomeForm.value.name.trim() !== '' && incomeForm.value.value > 0
})

const openDrawer = (income?: GeneralIncome) => {
  if (income) {
    isEditing.value = true
    incomeForm.value = {
      id: income.id,
      name: income.name,
      value: income.value,
      date: new Date(income.date),
      isFixed: income.isFixed,
      repeat: income.repeat || 1
    }
  } else {
    isEditing.value = false
    resetForm()
  }
  drawer.value = true
}

const closeDrawer = () => {
  drawer.value = false
  resetForm()
}

const resetForm = () => {
  incomeForm.value = {
    id: '',
    name: '',
    value: 0,
    date: dayjs(budgetStore.selectedDate).startOf('month').toDate(),
    isFixed: false,
    repeat: 1
  }
}

const handleSave = () => {
  if (!isValid.value) return

  const incomeData: GeneralIncome = {
    id: incomeForm.value.id || generateId(),
    name: incomeForm.value.name,
    value: incomeForm.value.value,
    date: dayjs(incomeForm.value.date).format('YYYY-MM-DD'),
    isFixed: incomeForm.value.isFixed,
    repeat: incomeForm.value.isFixed ? undefined : incomeForm.value.repeat
  }

  if (isEditing.value) {
    budgetStore.updateGeneralIncome(incomeData)
    toastStore.success('Ingreso actualizado')
  } else {
    budgetStore.addGeneralIncome(incomeData)
    toastStore.success('Ingreso agregado')
  }

  closeDrawer()
}

const handleDelete = async () => {
  const confirmed = await confirm({
    title: 'Eliminar ingreso',
    message: `¿Estás seguro de eliminar "${incomeForm.value.name}"?`,
    confirmColor: 'red'
  })

  if (confirmed) {
    budgetStore.deleteGeneralIncome(incomeForm.value.id)
    toastStore.success('Ingreso eliminado')
    closeDrawer()
  }
}

defineExpose({
  openDrawer
})
</script>

<style scoped lang="scss">
.add-income {
  &__help {
    margin: 4px 0 0;
    font-size: 0.7rem;
    color: $text-gray-md;
    font-family: $font;
  }

  &__delete {
    display: flex;
    justify-content: center;
    margin-top: 8px;
  }
}
</style>