<template>
  <div class="category-item">
    <div
      class="category-item__icon"
      :style="{ backgroundColor: category.backgroundColor }"
    >
      <component :is="getIconComponent" :color="colorWhite" />
    </div>

    <div class="category-item__name">
      {{ category.name }}
    </div>

    <div class="category-item__actions">
      <DotMenu :items="itemMenu" @onMenuClicked="handleMenuAction" />
    </div>
  </div>
</template>

<script setup lang="ts">
import DotMenu from '@/modules/shared/components/DotMenu.vue'
import type { Category } from '../categories.interface'
import EditIcon from '@/assets/icons/Edit.icon.vue'
import TrashIcon from '@/assets/icons/Trash.icon.vue'
import { colorWhite } from '@/styles/variables.styles'
import { computed } from 'vue'
import { getIcon } from '../categories.constants'

const itemMenu = [
  { label: 'Editar', id: 1, icon: EditIcon },
  { label: 'Eliminar', id: 2, icon: TrashIcon }
]

const props = defineProps<{
  category: Category
}>()

const emit = defineEmits(['edit', 'delete'])

const getIconComponent = computed(() => {
  return getIcon(props.category.icon)
})

const handleMenuAction = (id: number) => {
  if (id === 1) {
    emit('edit', props.category)
  } else if (id === 2) {
    emit('delete', props.category)
  }
}
</script>

<style scoped lang="scss">
.category-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  background-color: $bg-primary;
  padding: 10px;
  border-radius: 20px;

  &__name {
    color: $gray-text;
    flex-grow: 1;
    text-decoration: none;
    margin-left: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__btn {
    height: 35px;
    width: 35px;
    margin-left: 5px;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 12px;

    .icon {
      width: 30px !important;
      height: 30px !important;
    }
  }
}

.v-list-item__prepend > .v-avatar {
  margin-inline-end: 8px !important;
}
</style>
