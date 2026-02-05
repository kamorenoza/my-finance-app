<template>
  <div class="category-item">
    <div class="category-item__icon">
      <v-avatar size="28" :color="category.backgroundColor">
        <v-icon size="16" :color="category.iconColor">
          {{ category.icon }}
        </v-icon>
      </v-avatar>
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

const itemMenu = [
  { label: 'Editar', id: 1, icon: EditIcon },
  { label: 'Eliminar', id: 2, icon: TrashIcon }
]

const props = defineProps<{
  category: Category
}>()

const emit = defineEmits(['edit', 'delete'])

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
  background-color: $bg-item;
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
}

.v-list-item__prepend > .v-avatar {
  margin-inline-end: 8px !important;
}
</style>
