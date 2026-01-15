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
      <v-btn
        class="category-item__btn"
        icon
        variant="text"
        @click="$emit('delete', category)"
      >
        <v-icon class="category-icon">mdi-trash-can-outline</v-icon>
      </v-btn>
      <v-btn
        class="category-item__btn"
        icon
        variant="text"
        @click="$emit('edit', category)"
      >
        <v-icon class="category-icon">mdi-pencil-outline</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '../categories.interface'

defineProps<{
  category: Category
}>()

defineEmits(['edit', 'delete'])
</script>

<style scoped lang="scss">
.category-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  &__name {
    color: $gray-text;
    width: 175px;
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

  &:hover {
    background: none !important;
  }
}

.category-icon {
  color: $text-light-gray;
}

.v-list-item__prepend > .v-avatar {
  margin-inline-end: 8px !important;
}
</style>
