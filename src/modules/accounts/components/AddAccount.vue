<template>
  <v-btn
    :color="colorMdPrimary"
    class="btn-fab fab-button"
    @click="drawer = true"
    v-if="!account"
  >
    <AddIcon class="icon" />
  </v-btn>

  <v-navigation-drawer
    v-model="drawer"
    location="right"
    temporary
    width="350"
    persistent
    :touchless="true"
  >
    <v-card flat>
      <div class="px-3 pt-3 subtitle">
        {{ account ? 'Editar cuenta' : 'Agregar cuenta' }}
      </div>
      <v-card-text>
        <v-text-field
          class="general-input"
          v-model="name"
          label="Nombre de la cuenta*"
          density="comfortable"
        />

        <v-select
          v-model="type"
          :items="filteredAccountTypes"
          item-title="label"
          item-value="type"
          label="Tipo de cuenta*"
          :return-object="false"
          class="general-input"
          density="comfortable"
          :disabled="!!account"
        ></v-select>

        <!-- Campos adicionales para tarjeta de crédito -->
        <v-text-field
          v-if="type === 'TC'"
          ref="valueInput"
          class="general-input mb-5"
          density="comfortable"
          label="Cupo*"
          hide-details
          type="text"
          prefix="$"
          @update:model-value="onInput"
          :model-value="formattedValue"
          maxlength="12"
          inputmode="numeric"
          pattern="[0-9]*"
        />

        <v-text-field
          v-if="type === 'TC'"
          ref="valueInput"
          class="general-input mb-5"
          density="comfortable"
          label="Fecha de Corte (día del mes)*"
          hide-details
          type="text"
          @update:model-value="onInputDate"
          :model-value="cutoffDate"
          maxlength="2"
          inputmode="numeric"
          pattern="[0-9]*"
        />

        <v-text-field
          v-if="type === 'TC'"
          ref="valueInput"
          class="general-input mb-5"
          density="comfortable"
          label="Fecha de Pago (día del mes)*"
          hide-details
          type="text"
          @update:model-value="onInputDueDate"
          :model-value="dueDate"
          maxlength="2"
          inputmode="numeric"
          pattern="[0-9]*"
        />
      </v-card-text>
      <v-card-actions class="pr-4 mt-2">
        <v-spacer />
        <v-btn type="button" class="btn-neutro" @click="close">Cancelar</v-btn>
        <v-btn
          type="button"
          class="btn-primary"
          @click="saveAccount"
          :disabled="!name"
        >
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, computed, type Ref } from 'vue'
import { useAccountsStore } from '@/modules/accounts/accounts.store'
import { type Account } from '../accounts.interface'
import AddIcon from '@/assets/icons/Add.icon.vue'
import { colorMdPrimary } from '@/styles/variables.styles'
import { useToastStore } from '@/modules/shared/toast/toast.store'
import { ACCOUNTS_TYPES, AccountTypes } from '../accounts.constants'

const props = defineProps<{
  account?: Account
  drawer?: boolean | Ref<boolean>
}>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

const store = useAccountsStore()
const toast = useToastStore()

const drawer = ref(false)
const name = ref('')
const type = shallowRef(AccountTypes.normal)
const creditLimit = ref<number | null>(null)
const cutoffDate = ref<number | null>(null)
const dueDate = ref<number | null>(null)

// Filtrar tipos excluyendo "loan"
const filteredAccountTypes = computed(() => {
  return ACCOUNTS_TYPES.filter(acc => acc.type !== AccountTypes.loan)
})

const formattedValue = computed(() => {
  if (creditLimit.value === 0) return ''
  if (!creditLimit.value && creditLimit.value !== 0) return ''
  return creditLimit.value.toLocaleString('es-CO')
})

const saveAccount = () => {
  if (!props.account) {
    addAccount()
  } else {
    updateAccount()
  }
}

const addAccount = () => {
  if (!name.value || !type.value) return

  // Validar campos requeridos para tarjeta de crédito
  if (
    type.value === AccountTypes.TC &&
    (!creditLimit.value || !cutoffDate.value || !dueDate.value)
  ) {
    toast.error('Completa todos los campos de tarjeta de crédito')
    return
  }

  try {
    const newAccount: Account = {
      name: name.value,
      type: type.value as AccountTypes
    }

    if (type.value === AccountTypes.TC) {
      newAccount.creditLimit = creditLimit.value || undefined
      newAccount.cutoffDate = cutoffDate.value || undefined
      newAccount.dueDate = dueDate.value || undefined
    }

    store.addAccount(newAccount)
    toast.success('Cuenta creada')
    close()
  } catch (e: any) {
    toast.error(e.message)
  }
}

const updateAccount = () => {
  if (!name.value || !type.value) return

  // Validar campos requeridos para tarjeta de crédito
  if (
    type.value === AccountTypes.TC &&
    (!creditLimit.value || !cutoffDate.value || !dueDate.value)
  ) {
    toast.error('Completa todos los campos de tarjeta de crédito')
    return
  }

  try {
    if (!props.account) return
    const newAccount: Account = {
      ...props.account,
      name: name.value
    }

    if (type.value === AccountTypes.TC) {
      newAccount.creditLimit = creditLimit.value || undefined
      newAccount.cutoffDate = cutoffDate.value || undefined
      newAccount.dueDate = dueDate.value || undefined
    }

    store.updateAccount(newAccount)
    toast.success('Cuenta editada')
    close()
  } catch (e: any) {
    toast.error(e.message)
  }
}

const onInput = (val: string) => {
  const numeric = Number(val.replace(/[^\d]/g, ''))
  creditLimit.value = isNaN(numeric) ? 0 : numeric
}

const onInputDate = (val: string) => {
  const numeric = Number(val.replace(/[^\d]/g, ''))
  if (numeric < 1 || numeric > 31) {
    cutoffDate.value = null
    return
  }
  cutoffDate.value = isNaN(numeric) ? null : numeric
}

const onInputDueDate = (val: string) => {
  const numeric = Number(val.replace(/[^\d]/g, ''))
  if (numeric < 1 || numeric > 31) {
    dueDate.value = null
    return
  }
  dueDate.value = isNaN(numeric) ? null : numeric
}

watch(
  () => props.drawer,
  newVal => {
    if (typeof newVal === 'boolean') {
      drawer.value = newVal
    } else if (newVal && 'value' in newVal) {
      drawer.value = newVal.value
    }
  },
  { immediate: true }
)

watch(
  () => props.account,
  newVal => {
    if (newVal) {
      name.value = newVal.name
      type.value = newVal.type
      creditLimit.value = newVal.creditLimit || null
      cutoffDate.value = newVal.cutoffDate || null
      dueDate.value = newVal.dueDate || null
    } else {
      name.value = ''
      type.value = AccountTypes.normal
      creditLimit.value = null
      cutoffDate.value = null
      dueDate.value = null
    }
  },
  { immediate: true }
)

const close = () => {
  drawer.value = false

  if (props.account) {
    emit('close')
  } else {
    name.value = ''
    type.value = AccountTypes.normal
    creditLimit.value = null
    cutoffDate.value = null
    dueDate.value = null
  }
}
</script>

<style scoped lang="scss">
.fab-button {
  z-index: 10;
  width: 40px !important;
  height: 40px !important;
  display: flex;
  align-items: center;
  border-radius: 14px !important;

  @media (min-width: 960px) {
    width: 48px !important;
    height: 46px !important;
    border-radius: 16px !important;
  }
}
</style>
