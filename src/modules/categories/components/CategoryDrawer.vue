<!-- CategoryDrawerContent.vue -->
<template>
  <div class="category-drawer">
    <div class="d-flex align-center justify-space-between">
      <h2 class="category-drawer__title">Categorías</h2>
      <div>
        <TooltipFabButton
          tooltip="Categorias"
          :color="colorMdPrimary"
          @click="addCategory"
        >
          <template #icon>
            <AddIcon class="icon" />
          </template>
        </TooltipFabButton>
      </div>
    </div>

    <NewCategory
      v-if="newCategory"
      :newCategory="newCategory"
      :saveCategory="saveCategory"
      :cancelEdit="cancelAdd"
      class="mt-6"
    />

    <div class="category-drawer__list">
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
import TooltipFabButton from '@/modules/shared/components/TooltipFabButton.vue'
import { colorMdPrimary } from '@/styles/variables.styles'
import AddIcon from '@/assets/icons/Add.icon.vue'

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
.category-drawer {
  min-width: 280px;
  padding: 16px 15px;
  max-height: 100vh;
  overflow-y: auto;

  &__title {
    font-size: 16px;
    font-family: $font-medium;
    font-weight: 400;
  }

  &__item {
    transition: background-color 0.2s;

    &:hover {
      background-color: #f2f2f2;
    }
  }

  &__list {
    margin-top: 20px;
  }
}

:deep(
  .v-list-item--density-default:not(.v-list-item--nav).v-list-item--one-line
) {
  padding-inline-start: 0 !important;
  padding-inline-end: 0 !important;
}
</style>
