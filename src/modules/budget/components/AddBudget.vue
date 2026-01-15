<template>
  <div class="add-budget">
    <div class="add-budget__bar">
      <div>
        <v-btn
          icon
          size="large"
          :color="entry.type === 'ingreso' ? 'success' : 'error'"
          class="add-budget__type"
          @click="selectType"
        >
          <v-icon>
            {{ entry.type === 'ingreso' ? 'mdi-plus' : 'mdi-minus' }}
          </v-icon>
        </v-btn>
      </div>
      <div>
        <v-menu v-model="categoryMenu">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              class="add-budget__category"
              :style="{
                backgroundColor: entry?.category?.backgroundColor || 'gray'
              }"
            >
              <v-icon size="20" :color="entry?.category?.iconColor || 'white'">
                {{ entry?.category?.icon || 'mdi-shape-plus' }}
              </v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item
              v-for="cat in categoryStore.categories"
              :key="cat.id"
              @click="selectCategory(cat)"
            >
              <v-icon start :color="cat.iconColor">{{ cat.icon }}</v-icon>
              <v-list-item-title>{{ cat.name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <div class="add-budget__input">
        <v-text-field
          v-model="entry.name"
          density="compact"
          label="Descripción"
          variant="outlined"
          hide-details
          type="text"
          maxlength="100"
          @keyup.enter="goToValue"
          @focus="scrollIntoView(valueInput)"
        />
      </div>

      <div class="add-budget__input">
        <v-text-field
          ref="valueInput"
          density="compact"
          label="Valor"
          variant="outlined"
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
          icon
          class="btn-label add-budget__save"
          variant="plain"
          @click="saveEntry"
          :ripple="false"
        >
          <v-icon>mdi-check</v-icon>
        </v-btn>
        <AddBudgetMoreOptions v-model="entry" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, type Ref } from 'vue'
import { useBudgetStore } from '@/modules/budget/budget.store'
import type { Category } from '@/modules/categories/categories.interface'
import { useCategoryStore } from '@/modules/categories/categories.store'
import type { EntryType } from '../budget.interface'
import { useToastStore } from '@/modules/shared/toast/toast.store'
import AddBudgetMoreOptions from './AddBudgetMoreOptions.vue'

const store = useBudgetStore()
const categoryStore = useCategoryStore()
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
const categoryMenu = ref(false)
const typeMenu = ref(false)
const repeatEveryText = ref(
  entry.value.repeat > 0 ? entry.value.repeat.toString() : ''
)

watch(repeatEveryText, val => {
  entry.value.repeat = Number(val) || 1
})

const selectCategory = (category: Category) => {
  entry.value.category = category
  categoryMenu.value = false
}

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

  &__bar {
    display: flex;
    align-items: center;
    gap: 4px;

    @media (min-width: 960px) {
      gap: 8px;
    }
  }

  &__type {
    width: 24px;
    height: 24px;
  }

  &__category {
    border-radius: 100%;
    width: 35px;
    height: 35px;
    padding: 0;
  }

  &__input {
    width: 45%;
    font-size: 14px;
    scroll-margin-bottom: 200px;
  }

  &__button {
    width: 15px;
  }

  &__actions {
    display: flex;
    align-items: center;
  }

  &__save {
    color: $color-success;
    width: 20px;
    margin-left: 5px;

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
