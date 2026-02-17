<template>
  <v-card class="add-item-inline" @click="handleCardClick">
    <v-card-text class="add-item-inline__content">
      <div class="add-item-inline__main">
        <v-checkbox
          :model-value="false"
          hide-details
          density="compact"
          class="add-item-inline__checkbox"
          disabled
        />
        <div class="add-item-inline__inputs">
          <v-text-field
            ref="nameInput"
            v-model="form.name"
            :placeholder="
              isActive ? 'Nombre del artículo' : 'Agregar artículo...'
            "
            density="compact"
            hide-details
            class="add-item-inline__input add-item-inline__name"
            :readonly="!isActive"
            @focus="handleFocus"
            @keyup.enter="goToAmount"
          />
          <v-text-field
            v-if="isActive"
            ref="amountInput"
            v-model="formattedAmount"
            @update:model-value="onInputAmount"
            placeholder="Monto"
            density="compact"
            hide-details
            prefix="$"
            class="add-item-inline__input add-item-inline__amount"
            @keyup.enter="saveItem"
            @blur="saveItem"
          />
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{
  save: [name: string, amount: number]
}>()

const nameInput = ref()
const amountInput = ref()
const isActive = ref(false)

const form = ref({
  name: '',
  amount: 0
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

const handleCardClick = () => {
  if (!isActive.value) {
    isActive.value = true
    setTimeout(() => {
      nameInput.value?.focus()
    }, 100)
  }
}

const handleFocus = () => {
  isActive.value = true
}

const goToAmount = () => {
  if (form.value.name.trim()) {
    amountInput.value?.focus()
  }
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
  isActive.value = false
}
</script>

<style scoped lang="scss">
.add-item-inline {
  margin-bottom: 12px;
  border-radius: 18px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 2px dashed transparent;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12) !important;
    border-color: $blue;
  }

  &__content {
    padding: 12px 16px !important;
  }

  &__main {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__checkbox {
    flex-shrink: 0;
  }

  &__inputs {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__input {
    :deep(.v-field__input) {
      font-size: 0.95rem;
      padding: 0;
      min-height: 0;
    }

    :deep(.v-field__field) {
      padding-top: 0;
      padding-bottom: 0;
    }

    :deep(.v-field__outline) {
      display: none;
    }

    :deep(.v-field) {
      padding: 0;
    }
  }

  &__name {
    flex: 1;

    :deep(input) {
      &::placeholder {
        color: $text-gray-md;
        opacity: 1;
      }

      &:read-only::placeholder {
        color: $text-gray-lg;
      }
    }
  }

  &__amount {
    width: 120px;
    flex-shrink: 0;

    :deep(.v-field__input) {
      font-family: $font-medium;
      color: $blue;
    }
  }
}
</style>
