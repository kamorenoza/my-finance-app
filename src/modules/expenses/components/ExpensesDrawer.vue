<template>
  <SideDrawer
    v-model="drawer"
    :title="isEditing ? 'Editar gasto' : 'Agregar gasto'"
    :width="420"
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
          v-model="entry.name"
          class="general-input mb-5"
          density="comfortable"
          label="Descripción*"
          hide-details
          type="text"
          maxlength="100"
        />

        <v-text-field
          class="general-input mb-5"
          density="comfortable"
          label="Valor*"
          hide-details
          prefix="$"
          @update:model-value="onInput"
          :model-value="formattedValue"
          maxlength="12"
          pattern="[0-9]*"
          inputmode="numeric"
        />

        <DateSelector @on-change="onChangeDate" v-model="dateForDateSelector" />

        <v-select
          class="general-input mt-5"
          v-model="entry.selectedAccount"
          :items="accountOptions"
          item-title="name"
          return-object
          label="Cuenta"
          density="comfortable"
          hide-details
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
          @click="saveEntry"
          :disabled="!entry.name || !entry.value"
        >
          {{ isEditing ? 'Actualizar' : 'Guardar' }}
        </v-btn>
      </div>

      <div class="expenses-drawer__delete" v-if="isEditing">
        <p @click="handleDelete">Eliminar gasto</p>
      </div>
    </div>
  </SideDrawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SideDrawer from '@/modules/shared/components/SideDrawer.vue'
import { useExpensesStore } from '../expenses.store'
import { useAccountsStore } from '@/modules/accounts/accounts.store'
import { useToastStore } from '@/modules/shared/toast/toast.store'
import { useConfirm } from '@/modules/shared/composables/useConfirm'
import DateSelector from '@/modules/shared/components/DateSelector.vue'
import dayjs from 'dayjs'
import type { Expense, AccountReference } from '../expenses.interface'

const expensesStore = useExpensesStore()
const accountsStore = useAccountsStore()
const toast = useToastStore()
const confirm = useConfirm()

const drawer = ref(false)
const isEditing = ref(false)
const currentExpenseId = ref<string | null>(null)

const entry = ref({
  name: '',
  value: null as number | null,
  selectedAccount: null as AccountReference | null,
  date: dayjs().format('YYYY-MM-DD')
})

const accountOptions = computed(() => {
  return accountsStore.accounts.map(acc => ({
    id: acc.id,
    name: acc.name
  }))
})

const formattedValue = computed(() => {
  if (!entry.value.value && entry.value.value !== 0) return ''
  return entry.value.value.toLocaleString('es-CO')
})

const dateForDateSelector = computed({
  get: () => {
    if (!entry.value.date) return new Date()
    const [year, month, day] = entry.value.date.split('-')
    return new Date(
      Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day))
    )
  },
  set: (newDate: Date) => {
    const year = newDate.getUTCFullYear()
    const month = String(newDate.getUTCMonth() + 1).padStart(2, '0')
    const day = String(newDate.getUTCDate()).padStart(2, '0')
    entry.value.date = `${year}-${month}-${day}`
  }
})

const onInput = (val: string) => {
  const numeric = Number(val.replace(/[^\d]/g, ''))
  entry.value.value = isNaN(numeric) ? null : numeric
}

const onChangeDate = (date: Date) => {
  dateForDateSelector.value = date
}

const openDrawer = (selectedDate?: Date) => {
  isEditing.value = false
  currentExpenseId.value = null
  entry.value = {
    name: '',
    value: null,
    selectedAccount: null,
    date: selectedDate
      ? dayjs(selectedDate).format('YYYY-MM-DD')
      : dayjs().format('YYYY-MM-DD')
  }
  drawer.value = true
}

const openEditDrawer = (expense: Expense) => {
  isEditing.value = true
  currentExpenseId.value = expense.id
  entry.value = {
    name: expense.name,
    value: expense.value,
    selectedAccount: expense.account || null,
    date: dayjs(expense.date).format('YYYY-MM-DD')
  }
  drawer.value = true
}

const closeDrawer = () => {
  drawer.value = false
  setTimeout(() => {
    isEditing.value = false
    currentExpenseId.value = null
    entry.value = {
      name: '',
      value: null,
      selectedAccount: null,
      date: dayjs().format('YYYY-MM-DD')
    }
  }, 300)
}

const saveEntry = () => {
  if (!entry.value.name || !entry.value.value) return

  if (isEditing.value && currentExpenseId.value) {
    // Update existing expense
    expensesStore.updateExpense({
      id: currentExpenseId.value,
      name: entry.value.name,
      value: entry.value.value,
      account: entry.value.selectedAccount,
      date: new Date(entry.value.date)
    })
    toast.success('Gasto actualizado')
  } else {
    // Add new expense
    expensesStore.addExpense({
      name: entry.value.name,
      value: entry.value.value,
      account: entry.value.selectedAccount,
      date: new Date(entry.value.date)
    })
    toast.success('Gasto guardado')
  }

  closeDrawer()
}

const handleDelete = async () => {
  if (!currentExpenseId.value) return

  try {
    const confirmed = await confirm({
      title: '¿Eliminar gasto?',
      message: 'Esta acción no se puede deshacer'
    })

    if (confirmed) {
      expensesStore.deleteExpense(currentExpenseId.value)
      toast.success('Gasto eliminado')
      closeDrawer()
    }
  } catch {
    // User cancelled
  }
}

defineExpose({
  openDrawer,
  openEditDrawer
})
</script>

<style lang="scss" scoped>
.subtitle {
  font-size: 1.1rem;
  font-family: $font-medium;
  color: $text-gray;
}

.expenses-drawer__delete {
  padding: 20px 20px 0;
  font-size: 0.9rem;
  color: $color-red;
  text-align: right;
  font-family: $font-medium;
  cursor: pointer;
}
</style>
