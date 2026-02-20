<template>
  <div class="add-item-inline">
    <v-card class="add-item-inline__card">
      <div class="add-item-inline__content">
        <v-text-field
          ref="amountInput"
          v-model="formattedAmount"
          @update:model-value="onInputAmount"
          placeholder="Monto"
          density="comfortable"
          hide-details
          prefix="$"
          class="general-input add-item-inline__amount"
          maxlength="12"
          inputmode="numeric"
          pattern="[0-9]*"
          @keyup.enter="saveItem"
          @focus="preventScroll"
        />
        <v-text-field
          v-model="form.name"
          placeholder="Descripción"
          density="comfortable"
          hide-details
          class="general-input add-item-inline__name"
          @keyup.enter="goToAmount"
        />
      </div>
    </v-card>
    <v-btn
      :ripple="false"
      class="btn-fab add-item-inline__save"
      :disabled="!canSave"
      @click="saveItem"
    >
      <CheckIcon />
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CheckIcon from '@/assets/icons/Check.icon.vue'

const emit = defineEmits<{
  save: [name: string, amount: number]
}>()

const amountInput = ref()

const form = ref({
  name: '',
  amount: 0
})

const canSave = computed(() => {
  return form.value.name.trim() && form.value.amount > 0
})

const formattedAmount = computed({
  get: () => {
    if (form.value.amount === 0) return ''
    return form.value.amount.toLocaleString('es-CO')
  },
  set: (val: string) => {
    const numeric = Number(val.replace(/[^\d]/g, ''))
    form.value.amount = isNaN(numeric) ? 0 : numeric
  }
})

const onInputAmount = (val: string) => {
  const numeric = Number(val.replace(/[^\d]/g, ''))
  form.value.amount = isNaN(numeric) ? 0 : numeric
}

const goToAmount = () => {
  if (form.value.name.trim()) {
    amountInput.value?.focus()
  }
}

const preventScroll = () => {
  const el = document.querySelector('.list-detail') as HTMLElement
  if (el) el.scrollLeft = 0
}

const saveItem = () => {
  if (form.value.name.trim() && form.value.amount > 0) {
    emit('save', form.value.name, form.value.amount)
    resetForm()
  }
}

const resetForm = () => {
  form.value = {
    name: '',
    amount: 0
  }
}
</script>

<style scoped lang="scss">
.add-item-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: $bg-item;
  border-radius: 18px;
  padding: 8px;
  scroll-margin: 0;
  margin: 0 15px 10px;

  &__card {
    flex: 1;
    border-radius: 12px !important;
    box-shadow: none !important;
    background-color: transparent !important;
  }

  &__content {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
  }

  &__name {
    flex-shrink: 0;

    :deep(.v-field) {
      background-color: $white;
    }

    :deep(input) {
      scroll-margin: 0;
      font-size: 14px !important;
      padding: 0;
    }
  }

  &__amount {
    flex: 1;
    min-width: 100px;

    :deep(.v-field) {
      background-color: $white;
    }

    :deep(input) {
      scroll-margin: 0;
      font-size: 14px !important;
      padding: 0;
    }
  }

  &__btn {
    background-color: $color-lg-primary !important;
    height: 40px;
    width: 40px;
    border-radius: 12px;
    flex-shrink: 0;

    &:disabled {
      opacity: 0.4;
    }

    .icon {
      width: 24px !important;
      height: 24px !important;
    }
  }

  &__save {
    background: $color-md-primary;

    &:disabled {
      opacity: 0.6;
    }
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
</style>
