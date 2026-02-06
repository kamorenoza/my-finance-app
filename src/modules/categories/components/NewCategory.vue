<!-- src/modules/categories/components/NewCategory.vue -->
<template>
  <div class="category-item">
    <div v-if="!isEditing" class="category-item__header">
      <p>Agregar categoría</p>
      <v-btn @click="cancelEdit" class="btn-label category-item__close">
        <CloseIcon />
      </v-btn>
    </div>
    <div class="category-item__bar">
      <IconColorSelector
        :icon="icon"
        :backgroundColor="backgroundColor"
        @done="onIconColorSelected"
      />

      <!-- Input para el nombre de la categoría -->
      <v-text-field
        v-model="newCategory.name"
        dense
        autofocus
        class="general-input"
        placeholder="Categoria"
        :maxlength="100"
        @keydown.enter="saveCategory"
        @keydown.escape="cancelEdit"
      />

      <!-- Botones de acción -->
      <v-btn
        @click="saveCategory"
        class="btn-fab category-item__check"
        :disabled="!newCategory.name"
      >
        <CheckIcon :color="colorSecondary" />
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import IconColorSelector from './IconColorSelector.vue'
import type { Category } from '../categories.interface'
import { colorPrimary, colorSecondary } from '@/styles/variables.styles'
import CheckIcon from '@/assets/icons/Check.icon.vue'
import CloseIcon from '@/assets/icons/Close.icon.vue'

interface Props {
  saveCategory: (i: any) => void
  cancelEdit: () => void
  newCategory: Category
  isEditing?: boolean
}

const props = defineProps<Props>()
const icon = ref(props.newCategory.icon || 'cat1')
const backgroundColor = ref(props.newCategory.backgroundColor || colorPrimary)

const newCategory = ref(
  props.newCategory || {
    name: '',
    icon: 'cat1',
    iconColor: '#ffffff',
    backgroundColor: colorPrimary
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
  background-color: rgba($bg-primary, 0.9);
  padding: 10px;
  border-radius: 20px;
  margin-bottom: 20px;

  &:hover {
    background-color: $bg-primary;
  }

  &__bar {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  &__check {
    background: $color-lg-secondary;

    &:disabled {
      opacity: 0.6;
    }
  }

  &__header {
    padding-bottom: 10px;
    font-size: 0.8rem;
    font-family: $font-medium;
    padding-left: 5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__close {
    padding-right: 0;
    margin-right: -8px;
    margin-top: -2px;
    width: 30px;
    height: 30px;
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

:deep(.category-item__close .v-btn__content) {
  line-height: 16px !important;
  font-size: 13px;
}
</style>
