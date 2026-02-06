<template>
  <div class="fab-categories">
    <TooltipFabButton
      tooltip="Categorias"
      :color="colorMdPrimary"
      @click="handlePress"
    >
      <template #icon>
        <CategoriesIcon />
      </template>
    </TooltipFabButton>
  </div>
  <!-- Drawer lateral -->
  <v-navigation-drawer v-model="drawer" location="right" temporary width="350">
    <CategoryDrawer @done="drawer = false" @close="drawer = false" />
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CategoryDrawer from '@/modules/categories/components/CategoryDrawer.vue'
import { colorMdPrimary } from '@/styles/variables.styles'
import CategoriesIcon from '@/assets/icons/Categories.icon.vue'
import TooltipFabButton from '@/modules/shared/components/TooltipFabButton.vue'

const drawer = ref(false)

const handlePress = () => {
  drawer.value = true
}
</script>

<style scoped lang="scss">
.fab-categories {
  position: absolute;
  right: 55px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 9;
  top: -5px;
  padding-top: 10px;

  @media (min-width: 960px) {
    right: 10px;
    top: 63px;
  }

  .fab-button {
    z-index: 1;
    width: 40px !important;
    height: 40px !important;
    display: flex;
    align-items: center;
    border-radius: 14px !important;

    @media (min-width: 960px) {
      width: 48px !important;
      height: 46px !important;
      border-radius: 16px !important;
    }

    .icon {
      width: 30px;
    }
  }
  .icon-cat {
    font-size: 18px;
  }

  .fab-label {
    margin-top: 0px;
    font-size: 12px;
    color: $color-secondary;
    font-weight: 500;
    white-space: nowrap;
    margin-top: 6px;

    @media (max-width: 959px) {
      display: none;
      color: $color-white;
      margin-top: 0;
    }
  }

  &--drawer {
    right: 334px;

    .fab-label {
      display: none;
    }
  }
}
</style>
