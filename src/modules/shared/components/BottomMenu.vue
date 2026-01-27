<template>
  <div>
    <v-app-bar
      app
      flat
      color="white"
      v-if="isDesktop"
      elevation="4"
      class="floating-navbar d-flex align-center"
    >
      <v-btn icon color="primary" @click="toggleRail">
        <v-icon>{{ layout.rail ? 'mdi-menu-open' : 'mdi-menu' }}</v-icon>
      </v-btn>
    </v-app-bar>
    <!-- Menú lateral para pantallas grandes -->
    <v-navigation-drawer
      v-if="isDesktop"
      :rail="layout.rail"
      app
      permanent
      class="side-menu"
    >
      <v-list>
        <v-list-item
          v-for="item in items"
          class="px-2"
          @click="router.push(item.path)"
        >
          <div class="side-menu-item">
            <ExpenseHandIcon
              v-if="item.path === '/gastos'"
              class="side-menu-icon"
              :color="isActive('/gastos') ? colorPrimary : colorGrey"
            />
            <BudgetIcon
              v-if="item.path === '/'"
              class="side-menu-icon"
              :color="isActive('/') ? colorPrimary : colorGrey"
            />
            <PurseIcon
              v-if="item.path === '/cuentas'"
              class="side-menu-icon"
              :color="isActive('/cuentas') ? colorPrimary : colorGrey"
            />
            <NotesIcon
              v-if="item.path === '/notas'"
              class="side-menu-icon"
              :color="isActive('/notas') ? colorPrimary : colorGrey"
            />
            <ShoppingIcon
              v-if="item.path === '/compras'"
              class="side-menu-icon"
              :color="isActive('/compras') ? colorPrimary : colorGrey"
            />
            <span
              v-if="!layout.rail"
              :class="['side-menu-label', { active: isActive(item.path) }]"
            >
              {{ item.label }}
            </span>
          </div>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Menú inferior para móviles -->
    <div v-else class="bottom-menu">
      <v-row
        justify="space-around"
        align="center"
        no-gutters
        class="menu-items"
      >
        <v-col
          class="menu-btn"
          cols="2"
          :class="{ active: isActive('/cuentas') }"
        >
          <div class="menu-item" @click="router.push('/cuentas')">
            <PurseIcon
              class="menu-icon"
              :color="isActive('/cuentas') ? colorPrimary : colorGrey"
            />
          </div>
          <span :class="['menu-label', { active: isActive('/cuentas') }]">
            Cuentas
          </span>
        </v-col>

        <v-col
          class="menu-btn"
          cols="2"
          :class="{ active: isActive('/gastos') }"
        >
          <div class="menu-item" @click="router.push('/gastos')">
            <ExpenseHandIcon
              class="menu-icon"
              :color="isActive('/gastos') ? colorPrimary : colorGrey"
            />
          </div>
          <span :class="['menu-label', { active: isActive('/gastos') }]">
            Gastos
          </span>
        </v-col>

        <v-col cols="2" class="fab-container">
          <v-btn
            color="primary"
            class="btn-fab fab-button"
            @click="router.push('/')"
          >
            <BudgetIcon class="menu-fab-icon" />
          </v-btn>
          <span class="fab-label">Presupuesto</span>
        </v-col>

        <v-col
          class="menu-btn"
          cols="2"
          :class="{ active: isActive('/notas') }"
        >
          <div class="menu-item" @click="router.push('/notas')">
            <NotesIcon
              class="menu-icon"
              :color="isActive('/notas') ? colorPrimary : colorGrey"
            />
          </div>
          <span :class="['menu-label', { active: isActive('/notas') }]">
            Notas
          </span>
        </v-col>

        <v-col
          class="menu-btn"
          cols="2"
          :class="{ active: isActive('/compras') }"
        >
          <div class="menu-item" @click="router.push('/compras')">
            <ShoppingIcon
              class="menu-icon"
              :color="isActive('/compras') ? colorPrimary : colorGrey"
            />
          </div>
          <span :class="['menu-label', { active: isActive('/compras') }]">
            Compras
          </span>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useLayoutStore } from '@/modules/shared/store/layout'
import ExpenseHandIcon from '@/assets/icons/ExpenseHand.icon.vue'
import { colorGrey, colorPrimary } from '@/styles/variables.styles'
import PurseIcon from '@/assets/icons/Purse.icon.vue'
import NotesIcon from '@/assets/icons/Notes.icon.vue'
import ShoppingIcon from '@/assets/icons/Shopping.icon.vue'
import BudgetIcon from '@/assets/icons/Budget.icon.vue'

const layout = useLayoutStore()

const { mdAndUp } = useDisplay()
const isDesktop = computed(() => mdAndUp.value)

const route = useRoute()
const router = useRouter()

const isActive = path => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const items = [
  { path: '/', icon: 'mdi-finance', label: 'Presupuesto' },
  { path: '/cuentas', icon: ExpenseHandIcon, label: 'Cuentas' },
  { path: '/gastos', icon: 'mdi-cash-multiple', label: 'Gastos' },
  { path: '/notas', icon: 'mdi-notebook-edit', label: 'Notas' },
  { path: '/compras', icon: 'mdi-format-list-bulleted', label: 'Compras' }
]

onMounted(() => {
  const stored = localStorage.getItem('drawerRail')
  if (stored !== null) {
    layout.rail = stored === 'true'
  }
})

function toggleRail() {
  layout.rail = !layout.rail
  localStorage.setItem('drawerRail', String(layout.rail))
}
</script>

<style scoped lang="scss">
.floating-navbar {
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  height: 64px;
  z-index: 1100;
  backdrop-filter: blur(12px);
  background-color: rgba(255, 255, 255, 0.7); // blanco translúcido
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition:
    backdrop-filter 0.3s ease,
    background-color 0.3s ease;
}

.bottom-menu {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  height: 70px;
  z-index: 1000;
  padding-bottom: calc(env(safe-area-inset-bottom) + 80px);
  padding-left: 7px;
  padding-right: 7px;
  //border-radius: 25px 25px 0 0;
}

.menu-items {
  height: 100%;
  align-items: center;
  text-align: center;
  margin-top: -4px;
}

.menu-item {
  height: 40px;
}

.menu-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &.active {
    background-color: $color-lg-primary;
    border-radius: 8px;
  }
}

.menu-label {
  font-size: 9px;
  color: $color-grey;
  margin-top: -3px;
  transition: color 0.3s ease;

  &.active {
    color: $color-primary;
    font-weight: 500;
  }
}

.fab-container {
  position: relative;
  top: -6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.fab-button {
  box-shadow: 0 4px 12px rgba($color-primary, 0.4);
  animation: pulse 2.4s infinite;
}

.fab-label {
  font-size: 10px;
  color: $color-primary;
  margin-top: 2px;
}

.menu-icon {
  width: 40px;
  height: 40px;
}

.menu-fab-icon {
  width: 35px;
  height: 35px;
  margin-top: -3px;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba($color-primary, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba($color-primary, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba($color-primary, 0);
  }
}

.side-menu {
  padding-top: 20px;
  font-family: $font;
  background-color: #fff;
}

.side-menu-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  min-width: 200px;
  color: #333; /* Color más oscuro para los items */

  .v-icon {
    margin-right: 8px;
    font-size: 24px;
  }

  .side-menu-icon {
    width: 35px;
    height: 35px;
    margin-right: 3px;
  }
}

.side-menu-label {
  font-size: 14px;
  color: $color-grey;
  transition: color 0.3s ease;

  &.active {
    color: $color-primary;
    font-weight: 500;
  }
}
</style>
