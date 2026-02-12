<template>
  <div class="add-expense">
    <div class="add-expense__bar">
      <div class="add-expense__value">
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
          @keyup.enter="goToDesc"
          @focus="scrollIntoView(valueInput)"
          inputmode="numeric"
          pattern="[0-9]*"
        />
      </div>

      <div class="add-expense__input">
        <v-text-field
          ref="descInput"
          v-model="entry.name"
          class="secondary-input"
          label="Descripción"
          density="compact"
          :maxlength="100"
          @keyup.enter="saveEntry"
          hide-details
          @focus="scrollIntoView(valueInput)"
        />
      </div>

      <div class="add-expense__actions">
        <v-btn
          class="btn-fab add-expense__save"
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
import { computed, ref } from 'vue'
import { useToastStore } from '@/modules/shared/toast/toast.store'
import { useExpensesStore } from '@/modules/expenses/expenses.store'
import CheckIcon from '@/assets/icons/Check.icon.vue'

interface Props {
  selectedDate?: Date
}

const props = withDefaults(defineProps<Props>(), {
  selectedDate: () => new Date()
})

const toast = useToastStore()
const expensesStore = useExpensesStore()

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

const valueInput = ref()
const descInput = ref()
const entry = ref({
  name: '',
  value: null as number | null,
  account: null
})
const formattedValue = computed(() => {
  if (!entry.value.value && entry.value.value !== 0) return ''
  return entry.value.value.toLocaleString('es-CO')
})

const onInput = (val: string) => {
  const numeric = Number(val.replace(/[^\d]/g, ''))
  entry.value.value = isNaN(numeric) ? null : numeric
}

const goToDesc = () => {
  if (entry.value.name.trim() !== '') {
    descInput.value?.focus()
  }
}

const saveEntry = () => {
  if (!entry.value.name || !entry.value.value) return

  expensesStore.addExpense({
    name: entry.value.name,
    value: entry.value.value,
    account: entry.value.account,
    date: props.selectedDate
  })

  toast.success('Movimiento guardado')

  // Reset form
  entry.value = {
    name: '',
    value: null,
    account: null
  }
}

const scrollIntoView = (refEl: any) => {
  // Solo scroll en iOS cuando el teclado virtual está presente
  if (isIOS) {
    setTimeout(() => {
      refEl?.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }
}
</script>

<style scoped lang="scss">
.add-expense {
  position: absolute;
  bottom: 17px;
  left: 15px;
  width: calc(100% - 30px);

  @media (min-width: 960px) {
    display: none;
  }

  &__bar {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: $bg-item;
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
