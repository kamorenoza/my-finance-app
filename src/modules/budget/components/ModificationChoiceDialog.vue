<template>
  <v-dialog v-model="visible" max-width="400" persistent>
    <v-card class="modification-dialog">
      <v-card-title class="modification-dialog__title"
        >Aplicar cambios para</v-card-title
      >
      <v-card-text class="modification-dialog__content">
        <p class="modification-dialog__description">
          ¿A qué periodo deseas aplicar los cambios en "{{ entryName }}"?
        </p>

        <div class="modification-options">
          <v-btn
            variant="tonal"
            class="option-btn"
            @click="selectOption('this')"
            block
          >
            <div class="option-content">
              <span class="option-title">Este mes</span>
              <span class="option-desc">
                {{ currentMonthDisplay }}
              </span>
            </div>
          </v-btn>

          <v-btn
            variant="tonal"
            class="option-btn"
            @click="selectOption('all')"
            block
          >
            <div class="option-content">
              <span class="option-title">Todos los meses</span>
              <span class="option-desc">Pasados, presentes y futuros</span>
            </div>
          </v-btn>

          <v-btn
            variant="tonal"
            class="option-btn"
            @click="selectOption('future')"
            block
          >
            <div class="option-content">
              <span class="option-title">De este mes en adelante</span>
              <span class="option-desc"
                >{{ currentMonthDisplay }} y futuros</span
              >
            </div>
          </v-btn>
        </div>
      </v-card-text>

      <v-card-actions class="modification-dialog__actions">
        <v-spacer />
        <v-btn class="btn-label" @click="cancel">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/es'

interface Props {
  entryName: string
  referenceDate: Date
}

const props = defineProps<Props>()

const emit = defineEmits<{
  chosen: [scope: 'this' | 'all' | 'future']
  cancelled: []
}>()

const visible = ref(true)

const currentMonthDisplay = computed(() => {
  const date = dayjs(props.referenceDate).locale('es')
  const month = date.format('MMMM')
  const year = date.format('YYYY')
  return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`
})

const selectOption = (scope: 'this' | 'all' | 'future') => {
  visible.value = false
  emit('chosen', scope)
}

const cancel = () => {
  visible.value = false
  emit('cancelled')
}
</script>

<style scoped lang="scss">
.modification-dialog {
  background-color: $white;
  padding: 20px 10px 10px;
  box-shadow:
    0px 12px 32px rgba(0, 0, 0, 0.12),
    0px 2px 8px rgba(0, 0, 0, 0.06) !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
  border-radius: 32px !important;

  &__title {
    font-size: 1rem;
    font-family: $font-medium;
    padding: 0 24px 8px;
  }

  &__content {
    padding: 8px 24px !important;
  }

  &__description {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.6);
    margin-bottom: 16px;
  }

  &__actions {
    padding: 8px 24px 16px;
  }

  .btn-label {
    font-family: $font-medium;
  }

  .modification-options {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .option-btn {
    height: auto;
    padding: 12px 20px;
    text-align: left;
    justify-content: flex-start;
    background-color: $blue-md !important;
    border-radius: 26px;

    &:hover {
      background-color: $blue-lg !important;
    }

    :deep(.v-btn__overlay) {
      display: none !important;
    }

    :deep(.v-btn__underlay) {
      display: none !important;
    }
  }

  .option-content {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .option-title {
    font-size: 0.95rem;
    font-family: $font-medium;
    text-transform: uppercase;
    letter-spacing: normal;
  }

  .option-desc {
    font-size: 0.8rem;
    color: $text-gray-md;
    text-transform: none;
    letter-spacing: 0.2px;
  }
}
</style>
