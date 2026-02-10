<template>
  <div
    class="add-expense__container"
    ref="formContainer"
    :class="{ 'add-expense--focused': isFocused }"
  >
    <div v-if="isFocused" class="add-expense__overlay" @click="close"></div>

    <v-tooltip
      v-model="tooltipVisible"
      text="Agregar presupuesto"
      location="left"
      :open-on-hover="false"
      :open-on-focus="false"
      :open-on-click="false"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          :color="colorMdPrimary"
          class="btn-fab fab-button add-expense__button"
          @click="handlePress"
          @pointerdown="onPointerDown"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
          @pointerleave="onPointerLeave"
          @pointerenter="onPointerEnter"
          v-bind="props"
        >
          <AddIcon class="icon" />
        </v-btn>
      </template>
    </v-tooltip>

    <div class="add-expense">
      <div class="add-expense__header">
        <div class="subtitle">Agregar presupuesto</div>
        <div
          class="add-expense__pill"
          :class="entry.type"
          @click="onTypeChange"
        >
          {{ entry.type === 'gasto' ? 'Gasto' : 'Ingreso' }}
        </div>
      </div>

      <div class="add-expense__bar">
        <div class="add-expense__input">
          <v-text-field
            ref="descriptionInput"
            v-model="entry.name"
            density="compact"
            label="Descripción*"
            hide-details
            type="text"
            maxlength="100"
            @keydown.enter.prevent="goToValue"
            @focus="onInputFocus"
            class="general-input"
            enterkeyhint="next"
            :readonly="!isFocused"
            @click="openForm"
          />
        </div>

        <div class="add-expense__input add-expense__value">
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
            @focus="onInputFocus"
            pattern="[0-9]*"
            enterkeyhint="done"
          />
        </div>
      </div>
      <div class="add-expense__more">
        <div>
          <v-select
            class="general-input mt-3 mb-2"
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
                  <div
                    class="add-expense__cat"
                    :style="{
                      backgroundColor: (item.raw as any).backgroundColor
                    }"
                  >
                    <component
                      :is="getIcon((item.raw as any).category?.icon)"
                      :color="colorWhite"
                    />
                  </div>
                </template>
                <v-list-item-title>{{
                  (item.raw as any).name
                }}</v-list-item-title>
              </v-list-item>
            </template>

            <template v-slot:selection="{ item }">
              <div class="d-flex align-center">
                <div
                  class="add-expense__cat"
                  :style="{
                    backgroundColor: (item.raw as any).backgroundColor
                  }"
                >
                  <component
                    :is="getIcon((item.raw as any).category?.icon)"
                    :color="colorWhite"
                  />
                </div>
                {{ (item.raw as any).name }}
              </div>
            </template>
          </v-select>
        </div>

        <div class="add-expense__toggles justify-space-between">
          <v-switch
            v-model="entry.isPaid"
            label="Pagado"
            inset
            density="compact"
            hide-details
            :color="entry.isPaid ? 'success' : undefined"
            class="ma-0 pa-0 subtitle"
          />

          <DateSelector
            @on-change="onChangeDate"
            v-model="dateForDateSelector"
          />
        </div>

        <div class="add-expense__toggles">
          <div>
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
          </div>
          <v-switch
            v-model="isRepeating"
            label="Se repite"
            inset
            density="compact"
            hide-details
            :color="isRepeating ? 'success' : undefined"
            class="ma-0 pa-0 subtitle ms-7"
            :disabled="isFixed || !canEditRepeatingSettings"
          />
          <v-text-field
            v-if="isRepeating"
            type="text"
            label="Meses"
            density="compact"
            hide-details
            class="general-input repeat-input"
            pattern="[0-9]*"
            :model-value="formattedNumber"
            @update:model-value="onInputNumber"
            maxlength="5"
          />
        </div>

        <div class="mt-4">
          <v-text-field
            class="general-input mt-2"
            v-model="entry.comments"
            label="Comentarios"
            density="compact"
            rows="3"
            multi-line
            hide-details
          />
        </div>
      </div>

      <div class="add-expense__actions">
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

      <div class="add-expense__delete" v-if="budgetStore.selectedEntry">
        <p @click="deleteExpense">Eliminar Presupuesto</p>
      </div>
    </div>

    <ModificationChoiceDialog
      v-if="showModificationDialog"
      :entry-name="entry.name"
      :reference-date="budgetStore.selectedDate"
      @chosen="handleModificationChoice"
      @cancelled="handleModificationCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { useToastStore } from '@/modules/shared/toast/toast.store'
import type { EntryType, BudgetEntry } from '@/modules/budget/budget.interface'
import { useCategoryStore } from '@/modules/categories/categories.store'
import DateSelector from '@/modules/shared/components/DateSelector.vue'
import ModificationChoiceDialog from './ModificationChoiceDialog.vue'
import { colorMdPrimary, colorWhite } from '@/styles/variables.styles'
import AddIcon from '@/assets/icons/Add.icon.vue'
import { useConfirm } from '@/modules/shared/composables/useConfirm'
import { getIcon } from '@/modules/categories/categories.constants'
import { useBudgetStore } from '@/modules/budget/budget.store'
import { generateId } from '@/modules/shared/utils'

const props = defineProps<{}>()

const toast = useToastStore()
const budgetStore = useBudgetStore()
const categoryStore = useCategoryStore()
const confirm = useConfirm()

const valueInput = ref()
const descriptionInput = ref()
const isFocused = ref(false)
const keyboard = ref(false)
const tooltipVisible = ref(false)
const isLongPress = ref(false)
const showModificationDialog = ref(false)
const modificationChoice = ref<'this' | 'all' | 'future' | null>(null)
const originalEntry = ref<BudgetEntry | null>(null)
let longPressResetTimeout: ReturnType<typeof setTimeout> | null = null
let longPressTimeout: ReturnType<typeof setTimeout> | null = null
let tooltipAutoHideTimeout: ReturnType<typeof setTimeout> | null = null
const lastPointerType = ref<'mouse' | 'touch' | 'pen' | ''>('')

const entry = ref({
  id: '',
  name: '',
  value: 0,
  type: 'gasto' as EntryType,
  isFixed: false,
  isPaid: false,
  repeat: undefined as number | undefined,
  comments: '',
  date: new Date().toISOString().split('T')[0],
  category: null as any
})

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

const onInput = (val: string) => {
  const numeric = Number(val.replace(/[^\d]/g, ''))
  entry.value.value = isNaN(numeric) ? 0 : numeric
}

const onInputNumber = (val: string) => {
  const numeric = Number(val.replace(/[^\d]/g, ''))
  entry.value.repeat = isNaN(numeric) ? 0 : numeric
}

const close = () => {
  isFocused.value = false

  entry.value = {
    id: '',
    name: '',
    value: 0,
    type: 'gasto' as EntryType,
    isFixed: false,
    isPaid: false,
    repeat: undefined,
    comments: '',
    date: new Date().toISOString().split('T')[0],
    category: null as any
  }
  originalEntry.value = null
  budgetStore.setSelectedEntry(null)
  keyboard.value = false
}

const goToValue = () => {
  if (entry.value.name.trim() !== '') {
    valueInput.value?.focus()
  }
}

const onChangeDate = (newDate: Date) => {
  entry.value.date = newDate.toISOString().split('T')[0]
}

const dateForDateSelector = computed({
  get: () => {
    if (!entry.value.date) return new Date()
    return new Date(entry.value.date + 'T00:00:00')
  },
  set: (newDate: Date) => {
    entry.value.date = newDate.toISOString().split('T')[0]
  }
})

const onInputFocus = () => {
  //isFocused.value = true
}

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

const saveEntry = () => {
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

    if (budgetStore.selectedEntry && hasNameOrValueChanged.value) {
      // Si es edición y hay cambios en nombre o valor, mostrar opciones
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
  const budgetEntry: BudgetEntry = {
    ...entry.value,
    category: entry.value.category || null
  }

  // Independientemente de la opción elegida, si cambió isPaid, guardarlo solo para este mes
  if (hasIsPaidChanged.value) {
    budgetStore.updateEntryIsPaidForMonth(entry.value.id, entry.value.isPaid)
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

const openForm = () => {
  isFocused.value = true

  setTimeout(() => {
    descriptionInput.value.focus()
  }, 100)
}

const fillData = () => {
  if (budgetStore.selectedEntry) {
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

      entry.value.name = selectedEntry.name
      entry.value.value = selectedEntry.value
      entry.value.type = selectedEntry.type
      entry.value.category = selectedEntry.category || null
      entry.value.date = selectedEntry.date
      entry.value.isFixed = selectedEntry.isFixed
      entry.value.isPaid = selectedEntry.isPaid
      entry.value.repeat = selectedEntry.repeat
      entry.value.comments = selectedEntry.comments || ''
      entry.value.id = selectedEntry.id || ''

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
    }
  }
}

const showTooltip = (fromTouch = false) => {
  tooltipVisible.value = true
  if (fromTouch) {
    isLongPress.value = true
    if (tooltipAutoHideTimeout) {
      clearTimeout(tooltipAutoHideTimeout)
    }
    tooltipAutoHideTimeout = setTimeout(() => {
      hideTooltip()
    }, 1500)
  } else if (tooltipAutoHideTimeout) {
    clearTimeout(tooltipAutoHideTimeout)
  }
}

const hideTooltip = () => {
  tooltipVisible.value = false
  if (tooltipAutoHideTimeout) {
    clearTimeout(tooltipAutoHideTimeout)
  }
  if (longPressResetTimeout) {
    clearTimeout(longPressResetTimeout)
  }
  longPressResetTimeout = setTimeout(() => {
    isLongPress.value = false
  }, 300)
}

const startLongPress = () => {
  if (longPressTimeout) {
    clearTimeout(longPressTimeout)
  }
  longPressTimeout = setTimeout(() => {
    showTooltip(true)
  }, 500)
}

const endLongPress = () => {
  if (longPressTimeout) {
    clearTimeout(longPressTimeout)
  }
  if (isLongPress.value) {
    hideTooltip()
  }
}

const onPointerDown = (event: PointerEvent) => {
  lastPointerType.value = event.pointerType as 'mouse' | 'touch' | 'pen'
  if (event.pointerType === 'touch') {
    startLongPress()
  }
}

const onPointerEnter = (event: PointerEvent) => {
  if (event.pointerType === 'mouse') {
    showTooltip(false)
  }
}

const onPointerUp = (event: PointerEvent) => {
  if (event.pointerType === 'touch') {
    endLongPress()
  } else if (event.pointerType === 'mouse') {
    hideTooltip()
  }
}

const onPointerLeave = (event: PointerEvent) => {
  if (event.pointerType === 'mouse') {
    hideTooltip()
  } else if (event.pointerType === 'touch') {
    endLongPress()
  }
}

const handlePress = () => {
  if (isLongPress.value) {
    isLongPress.value = false
    return
  }
  isFocused.value = true
}

watch(
  () => budgetStore.selectedEntry,
  newFilter => {
    if (newFilter) {
      isFocused.value = true
      fillData()
    }
  },
  { deep: true }
)
</script>

<style scoped lang="scss">
.add-expense {
  padding: 0;
  position: absolute;
  bottom: calc(110px - 100dvh);
  height: calc(100dvh - 200px);
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

  .add-expense__container.add-expense--focused & {
    display: block;
  }

  &--focused {
    .add-expense {
      bottom: -5px;
      border-bottom: none;

      .add-expense__button {
        display: none;
      }
    }
  }

  &__overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100dvh;
    background-color: rgba(black, 0.7);
    z-index: 39;
  }

  &__button {
    height: 40px !important;
    width: 40px !important;
    border-radius: 14px !important;
    display: flex;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 25px;
  }

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

  &__container {
    @media (min-width: 960px) {
      display: none;
    }
  }

  @media (min-width: 960px) {
    bottom: 20px;
    max-width: 550px;
    display: none;

    &--focused {
      bottom: 20px;
    }
  }

  &__title {
    font-family: $font-medium;
    font-size: 12px;
  }

  &__bar {
    display: flex;
    align-items: center;
    gap: 5px;
    justify-content: space-between;

    @media (min-width: 960px) {
      gap: 8px;
    }
  }

  &__type {
    width: 20px;
    height: 45px;
    padding-top: 1px;
    margin-right: 2px;
  }

  &__category {
    border-radius: 8px !important;
    width: 30px !important;
    height: 30px !important;
    padding: 0;
  }

  &__cat {
    width: 25px;
    height: 25px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 5px;

    .icon {
      width: 18px !important;
      height: 18px !important;
    }
  }

  &__input {
    width: 100%;
    font-size: 14px;
    scroll-margin-bottom: 200px;
  }

  &__value {
    width: 60%;
  }

  &__button {
    width: 15px;
  }

  &__actions {
    display: flex;
    align-items: center;
  }

  &__save {
    width: 20px;
    padding-top: 15px;

    @media (min-width: 960px) {
      width: 40px;
      margin-left: 0;
    }
  }

  &__more {
    padding-bottom: 20px;
  }

  &__date-category {
    display: flex;
    align-items: center;
    gap: 60px;
  }

  &__toggles {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-top: 12px;

    .repeat-input {
      width: 100px;
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

:deep(.v-field__input) {
  font-size: 14px !important;
}

:deep(.v-switch .v-selection-control--dirty .v-switch__track) {
  background-color: $green;
}
</style>
