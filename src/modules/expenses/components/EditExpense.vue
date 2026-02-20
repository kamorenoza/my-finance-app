<template>
  <div
    class="edit-expense__container"
    :class="{ 'edit-expense--focused': isFocused }"
  >
    <div v-if="isFocused" class="edit-expense__overlay" @click="close"></div>

    <div class="edit-expense">
      <div class="edit-expense__header">
        <div class="subtitle">Editar gasto</div>
      </div>

      <div class="edit-expense__bar">
        <div class="edit-expense__input">
          <v-text-field
            ref="descriptionInput"
            v-model="entry.name"
            density="compact"
            label="Descripción*"
            hide-details
            type="text"
            maxlength="100"
            @keydown.enter.prevent="goToValue"
            class="general-input"
            enterkeyhint="next"
          />
        </div>

        <div class="edit-expense__input edit-expense__value">
          <v-text-field
            ref="valueInput"
            class="general-input"
            density="compact"
            label="Valor*"
            hide-details
            prefix="$"
            @update:model-value="onInput"
            :model-value="formattedValue"
            maxlength="12"
            @keyup.enter="saveEntry"
            pattern="[0-9]*"
            enterkeyhint="done"
          />
        </div>
      </div>

      <div class="edit-expense__more">
        <div class="edit-expense__toggles">
          <DateSelector
            @on-change="onChangeDate"
            v-model="dateForDateSelector"
          />
        </div>

        <div class="mt-3">
          <v-select
            class="general-input"
            v-model="entry.selectedAccount"
            :items="accountOptions"
            item-title="name"
            return-object
            label="Cuenta"
            density="comfortable"
            hide-details
          />
        </div>
      </div>

      <div class="edit-expense__actions">
        <v-btn type="button" class="btn-neutro" @click="close">Cancelar</v-btn>
        <v-btn
          type="button"
          class="btn-primary"
          @click="saveEntry"
          :disabled="!entry.name || !entry.value"
        >
          Guardar
        </v-btn>
      </div>

      <div class="edit-expense__delete" v-if="expense">
        <p @click="deleteExpense">Eliminar gasto</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { Expense, AccountReference } from '../expenses.interface'
import dayjs from 'dayjs'
import DateSelector from '@/modules/shared/components/DateSelector.vue'
import { useAccountsStore } from '@/modules/accounts/accounts.store'
import { useConfirm } from '@/modules/shared/composables/useConfirm'
import { AccountTypes } from '@/modules/accounts/accounts.constants'

interface Props {
  modelValue: boolean
  expense: Expense | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  expense: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [expense: Expense]
  delete: [expenseId: string]
}>()

const accountsStore = useAccountsStore()
const confirm = useConfirm()

const descriptionInput = ref()
const valueInput = ref()
const isFocused = ref(false)

const entry = ref({
  id: '',
  name: '',
  value: 0,
  selectedAccount: null as AccountReference | null,
  date: dayjs().format('YYYY-MM-DD'),
  isPending: false
})

// Flag to skip account watcher during programmatic data fill
let skipAccountWatch = false

watch(
  () => entry.value.selectedAccount,
  async newAccount => {
    if (skipAccountWatch) return
    if (!newAccount) {
      entry.value.isPending = false
      return
    }
    const account = accountsStore.accounts.find(a => a.id === newAccount.id)
    if (account?.type === AccountTypes.normal) {
      entry.value.isPending = await confirm({
        title: '¿Gasto pendiente?',
        message: '¿Este gasto está pendiente de aplicar a la cuenta?',
        confirmText: 'Sí',
        cancelText: 'No'
      })
    } else {
      entry.value.isPending = false
    }
  }
)

const accountOptions = computed(() => {
  return accountsStore.accounts.map(acc => ({
    id: acc.id,
    name: acc.name
  }))
})

const formattedValue = computed(() => {
  if (entry.value.value === 0) return ''
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
  entry.value.value = isNaN(numeric) ? 0 : numeric
}

const onChangeDate = (newDate: Date) => {
  const year = newDate.getUTCFullYear()
  const month = String(newDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(newDate.getUTCDate()).padStart(2, '0')
  entry.value.date = `${year}-${month}-${day}`
}

const goToValue = () => {
  if (entry.value.name.trim() !== '') {
    valueInput.value?.focus()
  }
}

const close = () => {
  isFocused.value = false
  emit('update:modelValue', false)
  skipAccountWatch = true
  entry.value = {
    id: '',
    name: '',
    value: 0,
    selectedAccount: null,
    date: dayjs().format('YYYY-MM-DD'),
    isPending: false
  }
  nextTick(() => {
    skipAccountWatch = false
  })
}

const saveEntry = () => {
  if (!entry.value.name || !entry.value.value || !props.expense) return

  const updatedExpense: Expense = {
    ...props.expense,
    name: entry.value.name,
    value: entry.value.value,
    account: entry.value.selectedAccount || null,
    date: entry.value.date,
    isPending: entry.value.isPending
  }

  emit('save', updatedExpense)
  close()
}

const deleteExpense = async () => {
  if (!props.expense?.id) return

  const confirmed = await confirm({
    title: 'Eliminar gasto',
    message: '¿Estás seguro de que deseas eliminar este gasto?'
  })

  if (confirmed && props.expense.id) {
    emit('delete', props.expense.id)
    close()
  }
}

const fillData = () => {
  if (props.expense) {
    skipAccountWatch = true
    entry.value = {
      id: props.expense.id,
      name: props.expense.name,
      value: props.expense.value,
      selectedAccount: props.expense.account || null,
      date: dayjs(props.expense.date).format('YYYY-MM-DD'),
      isPending: props.expense.isPending ?? false
    }
    nextTick(() => {
      skipAccountWatch = false
    })
  }
}

watch(
  () => props.modelValue,
  newVal => {
    isFocused.value = newVal
    if (newVal && props.expense) {
      fillData()
      setTimeout(() => descriptionInput.value?.focus(), 100)
    }
  }
)

watch(
  () => props.expense,
  () => {
    if (props.modelValue && props.expense) {
      fillData()
    }
  },
  { deep: true }
)
</script>

<style scoped lang="scss">
@import '@/styles/_variables.scss';

.edit-expense {
  padding: 0;
  position: absolute;
  bottom: calc(110px - 100dvh);
  height: calc(100vh - 200px);
  width: 100%;
  padding: 20px 15px 30px;
  border-radius: 32px 32px 0 0;
  display: none;
  transition: bottom 0.3s ease-in-out;
  border: 1px solid $bg-general;
  box-shadow:
    rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
    rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
  background: $white;
  left: 0;
  z-index: 40;

  .edit-expense__container.edit-expense--focused & {
    display: block;
  }

  &__overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 10;
    pointer-events: auto;
    cursor: pointer;
  }

  &__container {
    position: relative;
    width: 100%;
    height: 100%;
    z-index: -1;

    &.edit-expense--focused {
      z-index: 2;
      .edit-expense {
        bottom: 450px;
        border-bottom: none;
      }
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 20px;
    padding-top: 10px;

    .btn-label:last-of-type {
      color: $color-primary;
    }

    .btn-label:first-of-type {
      color: $text-gray-md;
    }
  }

  &__delete {
    padding: 20px 5px 0 20px;
    font-size: 0.9rem;
    color: $color-red;
    text-align: right;
    font-family: $font-medium;
    cursor: pointer;
  }
}

.edit-expense__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .subtitle {
    font-family: $font-medium;
    font-size: 1.1rem;
    margin: 0;
  }
}

.edit-expense__bar {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.edit-expense__input {
  &.edit-expense__value {
    text-align: right;
  }
}

.edit-expense__more {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
  max-height: calc(100dvh - 600px);
  overflow-y: auto;
}

.edit-expense__toggles {
  width: 100%;
}
</style>
