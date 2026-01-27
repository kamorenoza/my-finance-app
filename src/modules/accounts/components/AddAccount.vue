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
          :items="ACCOUNTS_TYPES"
          item-title="label"
          item-value="type"
          label="Tipo de cuenta*"
          :return-object="false"
          class="general-input"
          density="comfortable"
          :disabled="!!account"
        ></v-select>
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
import { ref, shallowRef, watch, type Ref } from 'vue'
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

const saveAccount = () => {
  if (!props.account) {
    addAccount()
  } else {
    updateAccount()
  }
}

const addAccount = () => {
  if (!name.value || !type.value) return
  try {
    const newAccount: Account = {
      name: name.value,
      type: type.value
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
  try {
    if (!props.account) return
    const newAccount: any = {
      ...props.account,
      name: name.value
    }
    store.updateAccount(newAccount)
    toast.success('Cuenta editada')
    close()
  } catch (e: any) {
    toast.error(e.message)
  }
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
    } else {
      name.value = ''
      type.value = AccountTypes.normal
    }
  },
  { immediate: true }
)

const close = () => {
  name.value = ''
  type.value = AccountTypes.normal
  drawer.value = false

  if (props.account) {
    emit('close')
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
  border-radius: 12px !important;

  @media (min-width: 960px) {
    width: 48px !important;
    height: 46px !important;
    border-radius: 16px !important;
  }
}
</style>
