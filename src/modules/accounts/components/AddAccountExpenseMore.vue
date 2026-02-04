<template>
  <v-btn
    v-if="!editView"
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
    @vue:unmounted="close"
  >
    <v-card flat>
      <div class="px-3 pt-3 d-flex align-center ga-3">
        <div class="subtitle">Agregar movimiento</div>
        <div
          class="expense-more__pill"
          :class="formData.type"
          @click="onTypeChange"
        >
          {{ formData.type === 'gasto' ? 'Gasto' : 'Ingreso' }}
        </div>
      </div>

      <v-card-text>
        <v-text-field
          class="general-input mb-5"
          v-model="formData.description"
          label="Descripción*"
          density="comfortable"
          hide-details
        />

        <v-text-field
          ref="valueInput"
          class="general-input mb-5"
          density="comfortable"
          label="Valor*"
          hide-details
          type="text"
          prefix="$"
          @update:model-value="onInput"
          :model-value="formattedValue"
          maxlength="12"
          inputmode="numeric"
          pattern="[0-9]*"
        />

        <v-select
          class="general-input mb-5"
          v-model="formData.category"
          :items="categories"
          item-title="name"
          return-object
          label="Categoría"
          density="comfortable"
          hide-details
        >
          <template v-slot:item="{ props, item }">
            <v-list-item
              v-bind="props"
              :title="undefined"
              :prepend-avatar="undefined"
            >
              <template v-slot:prepend>
                <v-avatar size="24" :color="(item.raw as any).backgroundColor">
                  <v-icon size="14" :color="(item.raw as any).iconColor">
                    {{ (item.raw as any).icon }}
                  </v-icon>
                </v-avatar>
              </template>
              <v-list-item-title>{{
                (item.raw as any).name
              }}</v-list-item-title>
            </v-list-item>
          </template>

          <template v-slot:selection="{ item }">
            <div class="d-flex align-center ga-2">
              <v-avatar size="20" :color="(item.raw as any).backgroundColor">
                <v-icon size="12" :color="(item.raw as any).iconColor">
                  {{ (item.raw as any).icon }}
                </v-icon>
              </v-avatar>
              {{ (item.raw as any).name }}
            </div>
          </template>
        </v-select>

        <DateSelector @on-change="onChangeDate" v-model="formData.date" />

        <v-switch
          v-if="account?.type === 'normal'"
          v-model="formData.isPending"
          label="Pendiente"
          inset
          density="compact"
          hide-details
          :color="formData.isPending ? 'success' : undefined"
          class="ma-0 pa-0 mb-3 mt-4 subtitle"
        />

        <v-text-field
          class="general-input mt-4"
          v-model="formData.comments"
          label="Comentarios"
          density="comfortable"
          rows="3"
          multi-line
          hide-details
        />
      </v-card-text>
      <v-card-actions class="pr-4 mt-2">
        <v-spacer />
        <v-btn type="button" class="btn-neutro" @click="close">Cancelar</v-btn>
        <v-btn
          type="button"
          class="btn-primary"
          @click="saveExpense"
          :disabled="!isFormValid"
        >
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AddIcon from '@/assets/icons/Add.icon.vue'
import { colorMdPrimary } from '@/styles/variables.styles'
import { useAccountsStore } from '../accounts.store'
import { useCategoryStore } from '../../categories/categories.store'
import { accountService } from '../accounts.service'
import type { Expense } from '../accounts.interface'
import { generateId } from '../../shared/utils'
import DateSelector from '@/modules/shared/components/DateSelector.vue'

interface Props {
  accountId: string
  editView?: boolean
  drawerOpen?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['closeEditExpense'])

const store = useAccountsStore()
const categoryStore = useCategoryStore()
const account = computed(() => store.getAccountById(props.accountId))

const drawer = ref(false)

const formData = ref({
  description: '',
  value: null as number | null,
  type: 'gasto' as string,
  category: null as any,
  date: new Date(),
  isPending: false,
  comments: ''
})

const categories = computed(() => categoryStore.categories)

const isFormValid = computed(() => {
  return (
    formData.value.description && formData.value.value && formData.value.date
  )
})

const formattedValue = computed(() => {
  if (formData.value.value === 0) return ''
  if (!formData.value.value && formData.value.value !== 0) return ''
  return formData.value.value.toLocaleString('es-CO')
})

const fillData = () => {
  if (props.editView) {
    const selectedExpense = store.selectedExpense
    if (selectedExpense) {
      formData.value.description = selectedExpense.description
      formData.value.value = selectedExpense.value
      formData.value.type = selectedExpense.type
      if (selectedExpense.category) {
        formData.value.category = selectedExpense.category
      }
      formData.value.date = new Date(selectedExpense.date)
      formData.value.isPending = selectedExpense.isPending
      formData.value.comments = selectedExpense.comments || ''
    }
  }
}

const onTypeChange = () => {
  formData.value.type = formData.value.type === 'gasto' ? 'ingreso' : 'gasto'
}

const onChangeDate = (newDate: Date) => {
  formData.value.date = newDate
}

const onInput = (val: string) => {
  const numeric = Number(val.replace(/[^\d]/g, ''))
  formData.value.value = isNaN(numeric) ? 0 : numeric
}

const saveExpense = () => {
  if (!isFormValid.value) return

  const newExpense: Expense = {
    id: generateId(),
    description: formData.value.description,
    value: formData.value.value!,
    type: formData.value.type as 'ingreso' | 'gasto',
    category: formData.value.category,
    date: formData.value.date,
    isPending: formData.value.isPending,
    comments: formData.value.comments || undefined
  }

  if (props.editView) {
    newExpense.id = store.selectedExpense?.id
    accountService.updateExpenseInAccount(props.accountId, newExpense)
  } else {
    accountService.addExpenseToAccount(props.accountId, newExpense)
  }

  store.loadAccounts()
  close()
}

const close = () => {
  if (props.editView) {
    store.setSelectedExpense(null)
    emit('closeEditExpense')
  }
  formData.value = {
    description: '',
    value: null,
    type: 'gasto',
    category: null,
    date: new Date(),
    isPending: false,
    comments: ''
  }
  drawer.value = false
}

watch(
  () => props.drawerOpen,
  newVal => {
    if (newVal !== undefined) {
      drawer.value = newVal
      fillData()
    }
  }
)
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
    width: 40px !important;
    height: 40px !important;
    border-radius: 14px !important;
  }
}

.expense-more {
  &__pill {
    padding: 4px 12px;
    border-radius: 16px;
    background-color: #e0e0e0;
    cursor: pointer;
    user-select: none;
    font-size: 0.85rem;
    color: $white;

    &.gasto {
      background-color: $color-red;
    }

    &.ingreso {
      background-color: $color-green;
    }
  }
}
</style>
