<!-- CategoryDrawerContent.vue -->
<template>
  <div class="category-drawer">
    <div class="category-drawer__header">
      <div class="category-drawer__back">
        <v-btn
          class="category-drawer__back-button"
          @click="onClose"
          :ripple="false"
        >
          <v-icon left>mdi-arrow-left</v-icon>
        </v-btn>
      </div>
      <h2 class="category-drawer__title">Categorías</h2>
      <div>
        <v-btn
          class="btn-fab fab-button"
          :color="colorMdPrimary"
          @click="addCategory"
        >
          <AddIcon class="icon" />
        </v-btn>
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
        <Transition name="category" tag="div" class="category-list">
          <CategoryItem
            v-if="editingCategory?.name !== cat.name"
            :key="cat.name"
            :category="cat"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </Transition>

        <NewCategory
          v-if="editingCategory && editingCategory?.name === cat.name"
          :isEditing="true"
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
import { colorMdPrimary, colorPrimary } from '@/styles/variables.styles'
import AddIcon from '@/assets/icons/Add.icon.vue'

const emit = defineEmits(['close'])

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
    icon: 'cat1',
    iconColor: '#ffffff',
    backgroundColor: colorPrimary
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

const onClose = () => {
  emit('close')
}
</script>

<style scoped lang="scss">
.category-drawer {
  min-width: 280px;
  padding: 16px 15px;
  padding-bottom: 0;
  padding-right: 0;
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

  &__header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 30px;
    padding-right: 15px;
  }

  &__list {
    margin-top: 15px;
    padding-bottom: 40px;
    height: calc(100dvh - 170px);
    overflow-y: auto;
    padding-right: 15px;
    padding-top: 5px;

    @media (min-width: 960px) {
      height: calc(100dvh - 85px);
    }
  }

  &__back {
    position: absolute;
    top: 2px;
    left: -15px;
    z-index: 8;

    &-button {
      background: none;
      border: none;
      box-shadow: none;
      padding-left: 0;
    }
  }

  .btn-fab {
    width: 40px !important;
    height: 40px !important;
    display: flex;
    align-items: center;
  }
}

:deep(
  .v-list-item--density-default:not(.v-list-item--nav).v-list-item--one-line
) {
  padding-inline-start: 0 !important;
  padding-inline-end: 0 !important;
}
</style>
