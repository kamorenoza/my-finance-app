<template>
  <v-btn
    :color="colorMdPrimary"
    class="btn-fab fab-button"
    @click="drawer = true"
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
      <div class="px-3 pt-3 subtitle">Agregar cuenta</div>
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
        ></v-select>

        <v-text-field
          v-if="type === AccountTypes.normal"
          v-model="initialValue"
          label="Saldo inicial (opcional)"
          type="text"
          v-currency
          prefix="$"
          class="general-input"
          density="comfortable"
          hint="Saldo inicial de la cuenta"
          persistent-hint
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
import { ref, shallowRef } from 'vue'
import { useAccountsStore } from '@/modules/accounts/accounts.store'
import { type Account } from '../accounts.interface'
import AddIcon from '@/assets/icons/Add.icon.vue'
import { colorMdPrimary } from '@/styles/variables.styles'
import { useToastStore } from '@/modules/shared/toast/toast.store'
import { ACCOUNTS_TYPES, AccountTypes } from '../accounts.constants'

const drawer = ref(false)
const name = ref('')
const initialValue = ref('')
const type = shallowRef(AccountTypes.normal)
const store = useAccountsStore()
const toast = useToastStore()

const saveAccount = () => {
  if (!name.value || !type.value) return
  try {
    const account: Account = {
      name: name.value,
      type: type.value as any,
      initialValue: parseInt(
        initialValue.value.toLocaleString().replace(/,/g, '')
      ),
      balance: parseInt(initialValue.value.toLocaleString().replace(/,/g, ''))
    }
    store.addAccount(account)
    toast.success('Cuenta agregada')
    close()
  } catch (e: any) {
    toast.error(e.message)
  }
}

const close = () => {
  name.value = ''
  type.value = AccountTypes.normal
  initialValue.value = ''
  drawer.value = false
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
