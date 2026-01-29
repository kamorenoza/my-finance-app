<template>
  <div class="add-expense">
    <div class="add-expense__bar">
      <div>
        <v-tooltip
          :model-value="showTypeTooltip"
          location="top"
          :text="tooltipText"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              :color="entry.type === 'ingreso' ? '#7ac07c' : '#cb4f47'"
              class="btn-circle add-expense__type"
              @click="selectType"
            >
              <PlusIcon v-if="entry.type === 'ingreso'" />
              <MinusIcon v-else />
            </v-btn>
          </template>
        </v-tooltip>
      </div>

      <div class="add-expense__input">
        <v-text-field
          v-model="entry.description"
          density="compact"
          placeholder="Descripción"
          hide-details
          type="text"
          maxlength="100"
          @keyup.enter="goToValue"
          @focus="scrollIntoView(valueInput)"
          class="secondary-input"
        />
      </div>

      <div class="add-expense__input add-expense__value">
        <v-text-field
          ref="valueInput"
          class="secondary-input"
          density="compact"
          placeholder="Valor"
          hide-details
          type="text"
          prefix="$"
          @update:model-value="onInput"
          :model-value="formattedValue"
          maxlength="12"
          @keyup.enter="saveEntry"
          @focus="scrollIntoView(valueInput)"
          inputmode="numeric"
          pattern="[0-9]*"
        />
      </div>

      <div class="add-expense__actions">
        <v-btn
          class="btn-icon add-expense__save"
          @click="saveEntry"
          :ripple="false"
          :disabled="!entry.description || !entry.value"
        >
          <CheckIcon />
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type Ref } from 'vue'
import { useToastStore } from '@/modules/shared/toast/toast.store'
import type { EntryType } from '@/modules/budget/budget.interface'
import CheckIcon from '@/assets/icons/Check.icon.vue'
import PlusIcon from '@/assets/icons/Plus.icon.vue'
import MinusIcon from '@/assets/icons/Minus.icon.vue'
import type { Expense } from '../accounts.interface'
import { useAccountsStore } from '../accounts.store'

const props = defineProps<{ accountId: string }>()

const toast = useToastStore()
const store = useAccountsStore()

const valueInput = ref()
const showTypeTooltip = ref(false)
let tooltipTimeout: ReturnType<typeof setTimeout> | null = null

const entry: Ref<Expense> = ref({
  description: '',
  value: 0,
  type: 'gasto' as EntryType,
  isPending: false,
  comments: '',
  date: new Date(),
  category: ''
})
const typeMenu = ref(false)

const tooltipText = computed(() => {
  return entry.value.type === 'ingreso' ? 'Ingreso' : 'Gasto'
})

const selectType = () => {
  typeMenu.value = !typeMenu.value
  entry.value.type = typeMenu.value ? 'ingreso' : 'gasto'

  // Show tooltip for 1 second
  showTypeTooltip.value = true
  if (tooltipTimeout) clearTimeout(tooltipTimeout)
  tooltipTimeout = setTimeout(() => {
    showTypeTooltip.value = false
  }, 1000)
}

const formattedValue = computed(() => {
  if (entry.value.value === 0) return ''
  if (!entry.value.value && entry.value.value !== 0) return ''
  return entry.value.value.toLocaleString('es-CO')
})

const onInput = (val: string) => {
  const numeric = Number(val.replace(/[^\d]/g, ''))
  entry.value.value = isNaN(numeric) ? 0 : numeric
}

const goToValue = () => {
  if (entry.value.description.trim() !== '') {
    valueInput.value?.focus()
  }
}

const saveEntry = () => {
  if (!entry.value.description || !entry.value.value) return
  try {
    store.addExpense(entry.value, props.accountId)
    toast.success('Movimiento agregado')

    entry.value = {
      description: '',
      value: 0,
      type: 'gasto' as EntryType,
      isPending: false,
      comments: '',
      date: new Date(),
      category: ''
    }
  } catch (e: any) {
    toast.error(e.message)
  }
}

const scrollIntoView = (refEl: any) => {
  setTimeout(() => {
    refEl?.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 100)
}
</script>

<style scoped lang="scss">
.add-expense {
  padding: 0;
  position: absolute;
  bottom: 40px;
  width: calc(100% - 30px);
  background-color: $bg-bar;
  padding: 10px 8px;
  border-radius: 16px;

  @media (min-width: 960px) {
    bottom: 20px;
    max-width: 550px;
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
    height: 20px;
    padding-top: 1px;
    margin-right: 2px;
  }

  &__category {
    border-radius: 8px !important;
    width: 30px !important;
    height: 30px !important;
    padding: 0;
  }

  &__input {
    width: 100%;
    font-size: 14px;
    scroll-margin-bottom: 200px;
  }

  &__value {
    width: 50%;
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
}

:deep(.v-field__input) {
  font-size: 14px !important;
}
</style>
