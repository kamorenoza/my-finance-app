<!-- CategoryDrawerContent.vue -->
<template>
  <div class="category-drawer-content pl-4 pr-2">
    <div class="d-flex align-center justify-space-between">
      <h2 class="category-title">Categorías</h2>
      <v-btn icon class="button-secondary" @click="addCategory">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </div>

    <NewCategory
      v-if="newCategory"
      :newCategory="newCategory"
      :saveCategory="saveCategory"
      :cancelEdit="cancelAdd"
      class="mt-6"
    />

    <div class="list-categories mt-5">
      <template v-for="cat in categoryStore.categories">
        <CategoryItem
          v-if="editingCategory?.name !== cat.name"
          :key="cat.name"
          :category="cat"
          @edit="handleEdit"
          @delete="handleDelete"
        />

        <NewCategory
          v-if="editingCategory && editingCategory?.name === cat.name"
          :newCategory="editingCategory"
          :saveCategory="updateCategory"
          :cancelEdit="cancelEdit"
          class="mb-3"
        />
      </template>
    </div>

    <div class="text-center"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import CategoryItem from './CategoryItem.vue'
import { useCategoryStore } from '@/modules/categories/categories.store'
import NewCategory from './NewCategory.vue'
import type { Category } from '../categories.interface'
import { useConfirm } from '@/modules/shared/composables/useConfirm'
import { useToastStore } from '@/modules/shared/toast/toast.store'

const categoryStore = useCategoryStore()
const confirm = useConfirm()
const toast = useToastStore()

const newCategory = ref<Category | null>(null)
const editingCategory = ref<Category | null>(null)

onMounted(async () => {
  categoryStore.loadCategories()
})

const addCategory = () => {
  editingCategory.value = null
  newCategory.value = {
    name: '',
    icon: 'mdi-currency-usd',
    iconColor: '#ffffff',
    backgroundColor: '#9C27B0'
  }
}

const cancelAdd = () => {
  newCategory.value = null
}

const saveCategory = () => {
  if (newCategory.value) {
    try {
      categoryStore.addCategory(newCategory.value)
      categoryStore.loadCategories()
      newCategory.value = null
      toast.success('Categoría agregada')
    } catch (e: any) {
      toast.error(e.message)
    }
  }
}

const updateCategory = () => {
  if (editingCategory.value) {
    categoryStore.updateCategory(editingCategory.value)
    categoryStore.loadCategories()
    editingCategory.value = null
    toast.success('Categoría editada')
  }
}

const cancelEdit = () => {
  editingCategory.value = null
}

const handleEdit = (category: Category) => {
  newCategory.value = null
  editingCategory.value = category
}

const handleDelete = async (category: any) => {
  const confirmed = await confirm({
    title: 'Eliminar categoría',
    message: `Se eliminará la categoría <strong>${category.name}</strong>, ¿Está seguro?`,
    confirmColor: 'red'
  })

  if (confirmed) {
    categoryStore.deleteCategory(category)
    toast.success('Categoría eliminada')
  }
}
</script>

<style scoped lang="scss">
.category-drawer-content {
  min-width: 280px;
  padding: 16px;
  max-height: 100vh;
  overflow-y: auto;
}

.category-title {
  font-size: 16px;
  font-family: $font-medium;
  font-weight: 400;
}

.category-item {
  transition: background-color 0.2s;
}

.category-item:hover {
  background-color: #f2f2f2;
}

:deep(
  .v-list-item--density-default:not(.v-list-item--nav).v-list-item--one-line
) {
  padding-inline-start: 0 !important;
  padding-inline-end: 0 !important;
}
</style>
