<template>
  <v-dialog v-model="visible" max-width="400" persistent>
    <v-card class="modification-dialog">
      <v-card-title class="general-title">Aplicar cambios para</v-card-title>
      <v-card-text class="py-4">
        <p class="text-caption text-medium-emphasis mb-4">
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
              <span class="option-desc text-caption">
                {{ currentMonthDisplay }}
              </span>
            </div>
          </v-btn>

          <v-btn
            variant="tonal"
            class="option-btn mt-2"
            @click="selectOption('all')"
            block
          >
            <div class="option-content">
              <span class="option-title">Todos los meses</span>
              <span class="option-desc text-caption"
                >Pasados, presentes y futuros</span
              >
            </div>
          </v-btn>

          <v-btn
            variant="tonal"
            class="option-btn mt-2"
            @click="selectOption('future')"
            block
          >
            <div class="option-content">
              <span class="option-title">De este mes en adelante</span>
              <span class="option-desc text-caption"
                >{{ currentMonthDisplay }} y futuros</span
              >
            </div>
          </v-btn>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn class="btn-neutro" @click="cancel">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

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
  return dayjs(props.referenceDate).format('MMMM YYYY')
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
  .option-btn {
    height: auto;
    padding: 12px 16px;
    text-align: left;
    justify-content: flex-start;

    &:hover {
      background-color: rgba(var(--v-theme-primary), 0.1);
    }
  }

  .option-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
  }

  .option-title {
    font-weight: 600;
    font-size: 0.95rem;
  }

  .option-desc {
    color: rgb(var(--v-theme-on-surface-variant));
  }
}
</style>
