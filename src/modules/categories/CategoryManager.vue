<template>
  <div class="fab-categories" :class="{ 'fab-categories--drawer': drawer }">
    <v-btn icon class="fab-button" @click="drawer = !drawer">
      <v-icon class="icon-cat">{{
        drawer ? 'mdi-chevron-right' : 'mdi-shape-plus'
      }}</v-icon>
    </v-btn>
    <span class="fab-label">Categorías</span>
  </div>
  <!-- Drawer lateral -->
  <v-navigation-drawer v-model="drawer" location="right" temporary width="320">
    <CategoryDrawer @done="drawer = false" />
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CategoryDrawer from '@/modules/categories/components/CategoryDrawer.vue'

const drawer = ref(false)
</script>

<style scoped lang="scss">
.fab-categories {
  position: absolute;
  right: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1100;
  top: 3px;
  padding-top: 10px;

  @media (min-width: 960px) {
    bottom: 24px;
    right: 24px;
    top: unset;
  }

  .fab-button {
    box-shadow: 0 4px 12px rgba(103, 58, 183, 0.4);
    background-color: $color-secondary;
    color: $color-white;

    @media (max-width: 959px) {
      width: 35px;
      height: 35px;
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
