<template>
  <v-app>
    <!--<div class="user-menu" v-if="!isLoginRoute">
      <v-menu location="bottom">
        <template #activator="{ props }">
          <div class="user-menu__trigger" v-bind="props">
            <UserIcon />
          </div>
        </template>
        <v-list class="user-menu-list">
          <v-list-item @click="handleLogout">
            <v-list-item-title>Cerrar sesión</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>-->
    <div :style="layoutStyle" class="main-div">
      <router-view />
      <BottomMenu />
    </div>
    <NotificationToast />
  </v-app>
</template>

<script setup lang="ts">
import BottomMenu from '@/modules/shared/components/BottomMenu.vue'
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useLayoutStore } from '@/modules/shared/store/layout'
import NotificationToast from '../toast/NotificationToast.vue'

const layout = useLayoutStore()
const { mdAndUp } = useDisplay()

const isDesktop = computed(() => mdAndUp.value)

const layoutStyle = computed(() => {
  if (!isDesktop.value) return {}

  const paddingLeft = layout.rail ? '72px' : '256px' // ajusta si usas otro ancho
  const paddingTop = '65px' // navbar flotante (64px alto + margen)

  return {
    paddingLeft,
    paddingTop
  }
})
</script>

<style lang="scss" scoped>
.main-div {
  position: relative;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}

.user-menu {
  display: flex;
  justify-content: flex-end;
  padding: 8px 16px;
  position: absolute;
  right: 0;
  z-index: 8;
  top: 3px;

  @media (min-width: 960px) {
    z-index: 907;
    top: 10px;
  }
}

.user-menu__trigger {
  cursor: pointer;
  font-weight: 600;
  color: $color-primary;
  background-color: $bg-input;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  width: 28px;
  height: 28px;
}

:deep(.v-overlay__content:has(.user-menu-list)) {
  min-width: 200px !important;
  width: 200px !important;
}
</style>
