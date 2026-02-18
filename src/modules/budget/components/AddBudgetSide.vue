<template>
  <v-navigation-drawer
    v-model="drawer"
    location="right"
    temporary
    width="400"
    persistent
    @vue:unmounted="close"
    class="add-budget__drawer"
  >
    <v-card flat>
      <div class="px-3 pt-3 d-flex align-center ga-3">
        <div class="subtitle">Agregar presupuesto</div>
        <div class="add-budget__pill" :class="entry.type" @click="onTypeChange">
          {{ entry.type === 'gasto' ? 'Gasto' : 'Ingreso' }}
        </div>
      </div>

      <v-card-text>
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

        <v-select
          class="general-input mb-5"
          v-model="entry.category"
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
                  <component
                    :is="getIcon((item.raw as any).category?.icon)"
                    :color="colorWhite"
                    size="14"
                  />
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
                <component
                  :is="getIcon((item.raw as any).category?.icon)"
                  :color="colorWhite"
                  size="12"
                />
              </v-avatar>
              {{ (item.raw as any).name }}
            </div>
          </template>
        </v-select>

        <DateSelector @on-change="onChangeDate" v-model="dateForDateSelector" />

        <v-switch
          v-model="entry.isPaid"
          label="Pagado"
          inset
          density="compact"
          hide-details
          :color="entry.isPaid ? 'success' : undefined"
          class="ma-0 pa-0 mb-3 mt-4 subtitle"
        />

        <div class="d-flex align-center ga-2 mb-3 mt-3">
          <v-switch
            v-model="isFixed"
            label="Es fijo"
            inset
            density="compact"
            hide-details
            :color="isFixed ? 'success' : undefined"
            class="ma-0 pa-0 subtitle"
            :disabled="isRepeating || !canEditRepeatingSettings"
          />
          <v-switch
            v-model="isRepeating"
            label="Se repite"
            inset
            density="compact"
            hide-details
            :color="isRepeating ? 'success' : undefined"
            class="ma-0 pa-0 subtitle"
            :disabled="isFixed || !canEditRepeatingSettings"
          />
        </div>

        <v-text-field
          v-if="isRepeating"
          type="text"
          label="Meses"
          density="compact"
          hide-details
          class="general-input mb-5"
          pattern="[0-9]*"
          :model-value="formattedNumber"
          @update:model-value="onInputNumber"
          maxlength="5"
          inputmode="numeric"
        />

        <v-text-field
          class="general-input mt-2"
          v-model="entry.comments"
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
          @click="saveEntry"
          :disabled="!entry.name || !entry.value"
        >
          Guardar
        </v-btn>
      </v-card-actions>

      <div class="add-budget__delete" v-if="budgetStore.selectedEntry">
        <p @click="deleteExpense">Eliminar Presupuesto</p>
      </div>
    </v-card>

    <ModificationChoiceDialog
      v-if="showModificationDialog"
      :entry-name="entry.name"
      :reference-date="budgetStore.selectedDate"
      @chosen="handleModificationChoice"
      @cancelled="handleModificationCancel"
    />
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import { colorWhite } from '@/styles/variables.styles'
import DateSelector from '@/modules/shared/components/DateSelector.vue'
import ModificationChoiceDialog from './ModificationChoiceDialog.vue'
import type { BudgetEntry, EntryType } from '../budget.interface'
import { useBudgetStore } from '../budget.store'
import { useCategoryStore } from '@/modules/categories/categories.store'
import { generateId } from '@/modules/shared/utils'
import { useToastStore } from '@/modules/shared/toast/toast.store'
import { getIcon } from '@/modules/categories/categories.constants'
import { useConfirm } from '@/modules/shared/composables/useConfirm'

const emit = defineEmits(['closeEditExpense'])

const budgetStore = useBudgetStore()
const categoryStore = useCategoryStore()
const toast = useToastStore()
const confirm = useConfirm()

const drawer = ref(false)
const showModificationDialog = ref(false)
const modificationChoice = ref<'this' | 'all' | 'future' | null>(null)
const originalEntry = ref<BudgetEntry | null>(null)
const entry = ref({
  id: '',
  name: '',
  value: 0,
  type: 'gasto' as EntryType,
  isFixed: false,
  isPaid: false,
  repeat: undefined as number | undefined,
  comments: '',
  date: dayjs(budgetStore.selectedDate).format('YYYY-MM-DD'),
  category: null as any
})

const openDrawer = () => {
  drawer.value = true
}

defineExpose({
  openDrawer
})

const fillData = () => {
  const selectedEntry = budgetStore.selectedEntry
  if (selectedEntry) {
    // Guardar una copia como original para detectar cambios
    originalEntry.value = JSON.parse(JSON.stringify(selectedEntry))

    // Aplicar modificaciones del mes actual a originalEntry
    const currentMonth = dayjs(budgetStore.selectedDate).format('YYYY-MM')
    const modification = selectedEntry.modifications?.find(
      m => m.month === currentMonth
    )
    if (modification) {
      if (modification.name !== undefined) {
        originalEntry.value!.name = modification.name
      }
      if (modification.value !== undefined) {
        originalEntry.value!.value = modification.value
      }
      if (modification.isPaid !== undefined) {
        originalEntry.value!.isPaid = modification.isPaid
      }
    }

    entry.value.id = selectedEntry.id
    entry.value.name = selectedEntry.name
    entry.value.value = selectedEntry.value
    entry.value.type = selectedEntry.type
    entry.value.isFixed = selectedEntry.isFixed
    entry.value.isPaid = selectedEntry.isPaid
    entry.value.repeat = selectedEntry.repeat
    entry.value.comments = selectedEntry.comments || ''
    entry.value.date = selectedEntry.date

    // Aplicar modificaciones del mes actual a entry también
    if (modification) {
      if (modification.name !== undefined) {
        entry.value.name = modification.name
      }
      if (modification.value !== undefined) {
        entry.value.value = modification.value
      }
      if (modification.isPaid !== undefined) {
        entry.value.isPaid = modification.isPaid
      }
    }

    // Encontrar la categoría correspondiente
    if (selectedEntry.category) {
      entry.value.category = selectedEntry.category
    }
  }
}

watch(
  () => budgetStore.selectedEntry,
  newValue => {
    if (newValue) {
      fillData()
      drawer.value = true
    }
  }
)

watch(
  () => drawer.value,
  newValue => {
    if (newValue) {
      if (!budgetStore.selectedEntry) {
        // Si no hay entrada seleccionada, inicializar con fecha del mes seleccionado
        entry.value.date = dayjs(budgetStore.selectedDate).format('YYYY-MM-DD')
      }
    }
  }
)

const onTypeChange = () => {
  entry.value.type = entry.value.type === 'gasto' ? 'ingreso' : 'gasto'
}

const canEditRepeatingSettings = computed(() => {
  // Permitir editar si:
  // - No estamos editando (entrada nueva), O
  // - Estamos editando pero la entrada NO es fija Y NO se repite
  if (!budgetStore.selectedEntry) {
    return true // Nueva entrada
  }
  // Estamos editando: solo permitir si NO es fija Y NO se repite
  return !originalEntry.value?.isFixed && !originalEntry.value?.repeat
})

const isFixed = computed({
  get: () => entry.value.isFixed,
  set: (value: boolean) => {
    if (canEditRepeatingSettings.value) {
      entry.value.isFixed = value
      if (value) {
        entry.value.repeat = undefined
      }
    }
  }
})

const isRepeating = computed({
  get: () => entry.value.repeat !== undefined,
  set: (value: boolean) => {
    if (canEditRepeatingSettings.value) {
      if (value) {
        entry.value.repeat = 1
      } else {
        entry.value.repeat = undefined
      }
    }
  }
})

const formattedValue = computed(() => {
  if (entry.value.value === 0) return ''
  if (!entry.value.value && entry.value.value !== 0) return ''
  return entry.value.value.toLocaleString('es-CO')
})

const formattedNumber = computed(() => {
  if (entry.value.repeat === 0) return ''
  if (!entry.value.repeat && entry.value.repeat !== 0) return ''
  return entry.value.repeat.toLocaleString('es-CO')
})

const categories = computed(() => categoryStore.categories)

const hasNameOrValueChanged = computed(() => {
  if (!originalEntry.value) return false
  return (
    entry.value.name !== originalEntry.value.name ||
    entry.value.value !== originalEntry.value.value
  )
})

const hasIsPaidChanged = computed(() => {
  if (!originalEntry.value) return false
  return entry.value.isPaid !== originalEntry.value.isPaid
})

const onInput = (val: string) => {
  const numeric = Number(val.replace(/[^\d]/g, ''))
  entry.value.value = isNaN(numeric) ? 0 : numeric
}

const onInputNumber = (val: string) => {
  const numeric = Number(val.replace(/[^\d]/g, ''))
  entry.value.repeat = isNaN(numeric) ? 0 : numeric
}

const onChangeDate = (newDate: Date) => {
  const year = newDate.getUTCFullYear()
  const month = String(newDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(newDate.getUTCDate()).padStart(2, '0')
  entry.value.date = `${year}-${month}-${day}`
}

const dateForDateSelector = computed({
  get: () => {
    if (!entry.value.date) return new Date()
    // Crear fecha en UTC para evitar problemas de zona horaria
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

const saveEntry = async () => {
  if (!entry.value.name || !entry.value.value) return
  try {
    const budgetEntry: BudgetEntry = {
      ...entry.value,
      category: entry.value.category || null
    }

    // Independientemente de lo demás, si cambió isPaid, guardarlo solo para este mes
    if (budgetStore.selectedEntry && hasIsPaidChanged.value) {
      budgetStore.updateEntryIsPaidForMonth(entry.value.id, entry.value.isPaid)
    }

    if (
      budgetStore.selectedEntry &&
      hasNameOrValueChanged.value &&
      (entry.value.isFixed || (entry.value.repeat && entry.value.repeat > 0))
    ) {
      // Si es edición, hay cambios en nombre/valor, y es Fixed o se repite, mostrar opciones
      showModificationDialog.value = true
      return // Esperar a que el usuario elija una opción
    } else if (budgetStore.selectedEntry) {
      // Edición sin cambios en nombre/valor
      // Si cambió isPaid, ya se guardó con updateEntryIsPaidForMonth
      // Solo llamar a updateEntry si no cambió isPaid
      if (!hasIsPaidChanged.value) {
        budgetStore.updateEntry(budgetEntry)
      }
      toast.success('Presupuesto editado')
    } else {
      // Nueva entrada
      budgetEntry.id = generateId()
      budgetStore.addEntry(budgetEntry)
      toast.success('Presupuesto agregado')
    }

    close()
  } catch (e: any) {
    toast.error(e.message)
  }
}

const handleModificationChoice = (choice: 'this' | 'all' | 'future') => {
  modificationChoice.value = choice
  showModificationDialog.value = false

  // Guardar la entrada con la opción elegida
  if (entry.value.name && entry.value.value) {
    saveEntryWithChoice(choice)
  }
}

const handleModificationCancel = () => {
  modificationChoice.value = null
  showModificationDialog.value = false
}

const saveEntryWithChoice = (choice: 'this' | 'all' | 'future') => {
  if (hasIsPaidChanged.value) {
    budgetStore.updateEntryIsPaidForMonth(entry.value.id, entry.value.isPaid)
  }
  const budgetEntry: BudgetEntry = {
    ...entry.value,
    category: entry.value.category || null
  }
  budgetStore.updateEntryWithModification(budgetEntry, choice)
  toast.success('Presupuesto editado')
  close()
}

const deleteExpense = async () => {
  const expense = budgetStore.selectedEntry

  if (!expense) {
    toast.error('No hay presupuesto seleccionado')
    return
  }

  if (!expense.id) {
    toast.error('Error: El presupuesto no tiene ID válido')
    return
  }

  const confirmed = await confirm({
    title: 'Eliminar presupuesto',
    message: `Se eliminará el presupuesto ${expense?.name} ¿Está seguro?`,
    confirmColor: 'red'
  })

  if (confirmed) {
    try {
      budgetStore.deleteEntry(expense.id)
      toast.success('Presupuesto eliminado')
      close()
    } catch (e: any) {
      toast.error('Error al eliminar el presupuesto')
    }
  }
}

const close = () => {
  entry.value = {
    id: '',
    name: '',
    value: 0,
    type: 'gasto' as EntryType,
    isFixed: false,
    isPaid: false,
    repeat: undefined,
    comments: '',
    date: dayjs(budgetStore.selectedDate).format('YYYY-MM-DD'),
    category: null as any
  }
  originalEntry.value = null
  budgetStore.setSelectedEntry(null)
  drawer.value = false
}
</script>

<style scoped lang="scss">
:deep(.add-budget__drawer) {
  z-index: 2400 !important;
  position: fixed !important;
}

.add-budget {
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

  &__delete {
    padding: 20px 20px 0;
    font-size: 0.9rem;
    color: $color-red;
    text-align: right;
    font-family: $font-medium;
    cursor: pointer;
  }
}

/* Estilizar toggles deshabilitados pero con checked/selected */
:deep(.v-switch.v-switch--checked.v-switch--disabled) {
  --v-switch-opacity: 1 !important;
}

:deep(.v-switch.v-switch--checked.v-switch--disabled .v-switch__track) {
  background-color: rgb(76, 175, 80) !important;
  opacity: 1 !important;
}

:deep(.v-switch.v-switch--checked.v-switch--disabled .v-switch__thumb) {
  background-color: rgb(76, 175, 80) !important;
  opacity: 1 !important;
}

/* Alternativa con aria-checked */
:deep([aria-checked='true'].v-switch--disabled .v-switch__track) {
  background-color: rgb(76, 175, 80) !important;
  opacity: 1 !important;
}

:deep([aria-checked='true'].v-switch--disabled .v-switch__thumb) {
  background-color: rgb(76, 175, 80) !important;
  opacity: 1 !important;
}
</style>
