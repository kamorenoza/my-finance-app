<!-- src/modules/categories/components/NewCategory.vue -->
<template>
  <div class="category-item d-flex align-center">
    <IconColorSelector
      :icon="icon"
      :backgroundColor="backgroundColor"
      :iconColor="iconColor"
      @done="onIconColorSelected"
    />

    <!-- Input para el nombre de la categoría -->
    <v-text-field
      v-model="newCategory.name"
      dense
      autofocus
      class="flex-grow-1 input-name"
      placeholder="Categoria"
      :maxlength="100"
      @keydown.enter="saveCategory"
      @keydown.escape="cancelEdit"
    />

    <!-- Botones de acción -->
    <v-btn @click="saveCategory" class="btn-label edit-button">
      <v-icon size="22" color="green">mdi-check</v-icon>
    </v-btn>
    <v-btn @click="cancelEdit" class="btn-label edit-button">
      <v-icon size="22" color="gray">mdi-close</v-icon>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import IconColorSelector from './IconColorSelector.vue'
import type { Category } from '../categories.interface'

interface Props {
  saveCategory: (i: any) => void
  cancelEdit: () => void
  newCategory: Category
}

const props = defineProps<Props>()
const icon = ref(props.newCategory.icon || 'mdi-currency-usd')
const backgroundColor = ref(props.newCategory.backgroundColor || '#9C27B0')
const iconColor = ref(props.newCategory.iconColor || '#ffffff')

const newCategory = ref(
  props.newCategory || {
    name: '',
    icon: 'mdi-currency-usd',
    iconColor: '#ffffff',
    backgroundColor: '#9C27B0'
  }
)

const saveCategory = () => {
  if (!newCategory.value.name?.trim()) return
  props.saveCategory(newCategory?.value)
}

const onIconColorSelected = (data: any) => {
  newCategory.value.icon = data.icon
  newCategory.value.iconColor = data.iconColor
  newCategory.value.backgroundColor = data.backgroundColor
}

const cancelEdit = () => {
  props.cancelEdit()
}
</script>

<style scoped lang="scss">
.category-item {
  display: flex;
  align-items: center;

  &:hover {
    background: transparent !important;
  }
}

.category-item v-icon {
  cursor: pointer;
}

.flex-grow-1 {
  flex-grow: 1;
}

.v-btn {
  box-shadow: none !important;
  border: none !important;
}

.v-btn .v-icon {
  font-size: 24px;
}

.v-col {
  padding: 0 !important;
}

.v-row {
  margin: 0 !important;
}

.edit-button {
  width: 35px;
  min-width: 0;
  padding: 0;
}

.input-name {
  margin-left: 15px;
}

:deep(.v-field__input) {
  padding: 0 5px 0 !important;
  font-size: 15px !important;
  min-height: 40px !important;
  height: 40px !important;
  background: none !important;

  .v-field__overlay {
    display: none !important;
  }
}

:deep(.v-field__overlay) {
  display: none !important;
}

:deep(.v-input__details) {
  display: none !important;
}
</style>
