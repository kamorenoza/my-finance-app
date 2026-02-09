<template>
  <div
    class="add-expense__container"
    ref="formContainer"
    :class="{ 'add-expense--focused': isFocused }"
  >
    <v-tooltip
      v-model="tooltipVisible"
      text="Agregar movimiento"
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
        <div class="subtitle">Agregar movimiento</div>
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
            v-model="entry.description"
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
                    :style="{ backgroundColor: (item.raw as any).backgroundColor }"
                  >
                  <component :is="getIcon((item.raw as any).category?.icon)" :color="colorWhite" />
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
                    :style="{ backgroundColor: (item.raw as any).backgroundColor }"
                  >
                  <component :is="getIcon((item.raw as any).category?.icon)" :color="colorWhite" />
                </div>
                {{ (item.raw as any).name }}
              </div>
            </template>
          </v-select>
        </div>
        <div class="add-expense__date-category">
          <v-switch
            v-if="account?.type === 'normal'"
            v-model="entry.isPending"
            label="Pendiente"
            inset
            density="compact"
            hide-details
            :color="entry.isPending ? 'success' : undefined"
            class="ma-0 pa-0 subtitle"
          />
          <DateSelector @on-change="onChangeDate" v-model="entry.date" />
        </div>

        <div>
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
          :disabled="!entry.description || !entry.value"
        >
          Guardar
        </v-btn>
      </div>

      <div class="add-expense__delete" v-if="store.selectedExpense">
        <p @click="deleteExpense">Eliminar Movimiento</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useToastStore } from '@/modules/shared/toast/toast.store'
import type { EntryType } from '@/modules/budget/budget.interface'
import { useAccountsStore } from '../accounts.store'
import { useCategoryStore } from '@/modules/categories/categories.store'
import DateSelector from '@/modules/shared/components/DateSelector.vue'
import { colorMdPrimary, colorWhite } from '@/styles/variables.styles'
import AddIcon from '@/assets/icons/Add.icon.vue'
import { useConfirm } from '@/modules/shared/composables/useConfirm'
import { getIcon } from '@/modules/categories/categories.constants'

const props = defineProps<{ accountId: string }>()

const toast = useToastStore()
const store = useAccountsStore()
const categoryStore = useCategoryStore()
const confirm = useConfirm()

const valueInput = ref()
const descriptionInput = ref()
const isFocused = ref(false)
const keyboard = ref(false)
const tooltipVisible = ref(false)
const isLongPress = ref(false)
let longPressResetTimeout: ReturnType<typeof setTimeout> | null = null
let longPressTimeout: ReturnType<typeof setTimeout> | null = null
let tooltipAutoHideTimeout: ReturnType<typeof setTimeout> | null = null
const lastPointerType = ref<'mouse' | 'touch' | 'pen' | ''>('')

const entry = ref({
  description: '',
  value: 0,
  type: 'gasto' as EntryType,
  isPending: false,
  comments: '',
  date: new Date(),
  category: null as any,
  id: ''
})

const account = computed(() => store.getAccountById(props.accountId))

const onTypeChange = () => {
  entry.value.type = entry.value.type === 'gasto' ? 'ingreso' : 'gasto'
}

const formattedValue = computed(() => {
  if (entry.value.value === 0) return ''
  if (!entry.value.value && entry.value.value !== 0) return ''
  return entry.value.value.toLocaleString('es-CO')
})

const categories = computed(() => categoryStore.categories)

const onInput = (val: string) => {
  const numeric = Number(val.replace(/[^\d]/g, ''))
  entry.value.value = isNaN(numeric) ? 0 : numeric
}

const close = () => {
  isFocused.value = false

  entry.value = {
    description: '',
    value: 0,
    type: 'gasto' as EntryType,
    isPending: false,
    comments: '',
    date: new Date(),
    category: null as any,
    id: ''
  }
  store.setSelectedExpense(null)
  keyboard.value = false
}

const goToValue = () => {
  if (entry.value.description.trim() !== '') {
    valueInput.value?.focus()
  }
}

const onChangeDate = (newDate: Date) => {
  entry.value.date = newDate
}

const onInputFocus = () => {
  //isFocused.value = true
}

const saveEntry = () => {
  if (!entry.value.description || !entry.value.value) return
  try {
    if (store.selectedExpense) {
      entry.value.id = store.selectedExpense?.id || ''
      store.updateExpense(props.accountId, entry.value)
      toast.success('Movimiento editado')
    } else {
      store.addExpense(entry.value, props.accountId)
      toast.success('Movimiento agregado')
    }

    close()
  } catch (e: any) {
    toast.error(e.message)
  }
}

const deleteExpense = async () => {
  const expense = store.selectedExpense
  const confirmed = await confirm({
    title: 'Eliminar movimiento',
    message: `Se eliminará el movimiento ${expense?.description} ¿Está seguro?`,
    confirmColor: 'red'
  })

  if (confirmed) {
    if (!expense?.id) return
    store.deleteExpense(props.accountId, expense?.id)
    toast.success('Movimiento eliminado')
    close()
  }
}

const openForm = () => {
  isFocused.value = true

  setTimeout(() => {
    descriptionInput.value.focus()
  }, 100)
}

const fillData = () => {
  if (store.selectedExpense) {
    const selectedExpense = store.selectedExpense
    if (selectedExpense) {
      entry.value.description = selectedExpense.description
      entry.value.value = selectedExpense.value
      entry.value.type = selectedExpense.type
      if (selectedExpense.category) {
        entry.value.category = selectedExpense.category
      }
      entry.value.date = new Date(selectedExpense.date)
      entry.value.isPending = selectedExpense.isPending
      entry.value.comments = selectedExpense.comments || ''
      entry.value.id = selectedExpense.id || ''
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
  () => store.selectedExpense,
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
  bottom: calc(110px - 100vh);
  height: calc(100vh - 200px);
  width: 100%;
  padding: 20px 15px 30px;
  border-radius: 32px 32px 0 0;
  display: block;
  transition: bottom 0.3s ease-in-out;
  border: 1px solid $bg-general;
  box-shadow:
    rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
    rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
  background: $white;
  left: 0;
  z-index: 10;

  &--focused {
    .add-expense {
      bottom: -5px;
      border-bottom: none;

      .add-expense__button {
        display: none;
      }
    }

    &:after {
      content: '';
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      background: rgba(#000000, 0.7);
      z-index: 9;
    }
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
    &:has(.add-expense--focused) {
      position: absolute;
      top: 0;
      left: 0;
      background-color: rgba(black, 0.6);
      width: 100%;
      height: 100%;
      z-index: 1001;
    }

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

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 20px;

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
</style>
