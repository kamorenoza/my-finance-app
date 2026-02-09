<template>
  <div class="add-budget">
    <div class="add-budget__bar">
      <div>
        <v-btn
          icon
          size="large"
          :color="entry.type === 'ingreso' ? '#6aa66c' : '#cb4f47'"
          class="add-budget__type"
          @click="selectType"
        >
          <v-icon>
            {{ entry.type === 'ingreso' ? 'mdi-plus' : 'mdi-minus' }}
          </v-icon>
        </v-btn>
      </div>

      <div class="add-budget__input">
        <v-text-field
          v-model="entry.name"
          class="secondary-input"
          label="Descripción"
          density="compact"
          :maxlength="100"
          @keyup.enter="goToValue"
          hide-details
          @focus="scrollIntoView(valueInput)"
        />
      </div>

      <div class="add-budget__value">
        <v-text-field
        class="secondary-input"
          ref="valueInput"
          density="compact"
          label="Valor"
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

      <div class="add-budget__actions">
        <v-btn
          class="btn-fab add-budget__save"
          @click="saveEntry"
          :ripple="false"
          :disabled="!entry.name || !entry.value"
        >
          <CheckIcon />
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, type Ref } from 'vue'
import { useBudgetStore } from '@/modules/budget/budget.store'
import type { EntryType } from '../budget.interface'
import { useToastStore } from '@/modules/shared/toast/toast.store'
import CheckIcon from '@/assets/icons/Check.icon.vue'

const store = useBudgetStore()
const toast = useToastStore()

const valueInput = ref()
const entry = ref({
  name: '',
  value: null as number | null,
  category: null as any,
  type: 'gasto' as EntryType,
  isFixed: false,
  repeat: 0
})
const menu = ref(false)
const typeMenu = ref(false)
const repeatEveryText = ref(
  entry.value.repeat > 0 ? entry.value.repeat.toString() : ''
)

watch(repeatEveryText, val => {
  entry.value.repeat = Number(val) || 1
})


const selectType = () => {
  typeMenu.value = !typeMenu.value
  entry.value.type = typeMenu.value ? 'ingreso' : 'gasto'
}

const formattedValue = computed(() => {
  if (!entry.value.value && entry.value.value !== 0) return ''
  return entry.value.value.toLocaleString('es-CO')
})

const onInput = (val: string) => {
  const numeric = Number(val.replace(/[^\d]/g, ''))
  entry.value.value = isNaN(numeric) ? null : numeric
}

const goToValue = () => {
  if (entry.value.name.trim() !== '') {
    valueInput.value?.focus()
  }
}

const saveEntry = () => {
  if (!entry.value.name || !entry.value.value) return

  store.addEntry({
    name: entry.value.name,
    value: entry.value.value,
    date: new Date().toISOString(),
    category: entry.value.category?.id || '',
    type: entry.value.type,
    isFixed: entry.value.isFixed,
    isPaid: false
  })

  entry.value.name = ''
  entry.value.value = null
  entry.value.category = null
  entry.value.isFixed = false
  entry.value.repeat = 0
  entry.value.type = 'gasto'
  menu.value = false
  toast.success('Movimiento guardado')
}

const scrollIntoView = (refEl: any) => {
  setTimeout(() => {
    refEl?.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 100)
}
</script>

<style scoped lang="scss">
.add-budget {
  padding: 0 12px;
  position: absolute;
  bottom: 20px;
  width: 100%;

  @media (min-width: 960px) {
    display: none;
  }

  &__bar {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: $bg-general;
    padding: 10px 15px;
    border-radius: 24px;

    @media (min-width: 960px) {
      gap: 8px;
    }
  }

  &__type {
    width: 24px;
    height: 24px;
    box-shadow: none;
  }

  &__category {
    border-radius: 100%;
    width: 35px;
    height: 35px;
    padding: 0;
  }

  &__input {
    width: 60%;
    font-size: 14px;
    scroll-margin-bottom: 200px;
    flex-grow: 1;
  }

  &__value {
    width: 150px;
  }

  &__button {
    width: 15px;
  }

  &__actions {
    display: flex;
    align-items: center;
  }

  &__save {
    background: $color-md-primary;

    &:disabled {
      opacity: 0.6;
    }
  }

  .btn-fab {
    width: 40px !important;
    height: 40px !important;
    border-radius: 12px !important;

    .icon {
      width: 30px;
      height: 30px;
    }
  }
}

::deep(.v-field__input) {
  background-color: $color-white !important;
}
</style>
