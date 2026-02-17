<template>
  <div class="fab-categories">
    <TooltipFabButton
      tooltip="Categorias"
      :color="colorMdPrimary"
      @click="handlePress"
      button-class="has-label"
    >
      <template #icon>
        <CategoriesIcon />
        <span class="fab-label">Categorías</span>
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
  right: 15px;
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

      @media (min-width: 960px) {
        width: 23px !important;
        height: 23px !important;
      }
    }
  }
  .icon-cat {
    font-size: 18px;
  }

  .fab-label {
    margin-top: 0px;
    font-size: 0.9rem;
    letter-spacing: normal;
    text-transform: none;
    color: $color-primary;
    margin-left: 2px;
    display: none;

    @media (min-width: 960px) {
      display: block;
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
