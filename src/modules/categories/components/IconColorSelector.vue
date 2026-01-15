<template>
  <v-btn
    icon
    class="d-flex justify-center align-center text-medium selector"
    :style="{ backgroundColor: colorButtonBackground, borderRadius: '50%' }"
    @click="togglePopover"
  >
    <v-icon size="16" class="selector-icon" :style="{ color: colorIcon }">{{
      currentIcon
    }}</v-icon>
  </v-btn>

  <div v-if="showPopover" class="popover-content">
    <v-card class="pa-4" max-width="293" elevation="2">
      <p class="title">Iconos</p>
      <div class="icon-grid">
        <v-btn
          v-for="(icon, index) in categoriesIcons"
          :key="index"
          class="icon-button"
          :icon="icon"
          @click="handleIconClick(icon)"
        />
      </div>

      <p class="title mb-2 mt-3">Color fondo del icono</p>
      <div class="color-grid">
        <ColorPickerButton v-model="colorButtonBackground" />
      </div>

      <p class="title mb-1 mt-5">Color del icono</p>
      <div class="color-grid">
        <div class="color-grid">
          <ColorPickerButton v-model="colorIcon" />
        </div>
      </div>
      <v-btn @click="handleColorChange" class="btn-neutro mt-5">Cerrar</v-btn>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { categoryIcons } from '../categories.constants'
import ColorPickerButton from '@/modules/shared/components/ColorPickerButton.vue'

interface Props {
  icon: string
  backgroundColor: string
  iconColor: string
}

const emit = defineEmits(['done'])
const props = defineProps<Props>()

const showPopover = ref(false)
const categoriesIcons = ref(categoryIcons)
const colorButtonBackground = ref(props.backgroundColor)
const colorIcon = ref(props.iconColor)
const currentIcon = ref(props.icon)

watch(
  () => [props.icon, props.backgroundColor, props.iconColor],
  ([newIcon, newBg, newIconColor]) => {
    currentIcon.value = newIcon
    colorButtonBackground.value = newBg
    colorIcon.value = newIconColor
  }
)

const togglePopover = () => {
  showPopover.value = !showPopover.value
}

const handleIconClick = (icon: string) => {
  currentIcon.value = icon
}

const handleColorChange = () => {
  showPopover.value = false
  emit('done', {
    icon: currentIcon.value,
    backgroundColor: colorButtonBackground.value,
    iconColor: colorIcon.value
  })
}
</script>

<style scoped lang="scss">
.popover-content {
  position: absolute;
  top: 135px;
  left: 160px;
  transform: translateX(-50%);
  z-index: 999;
  width: 293px;
}

.icon-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.icon-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: transparent;
  box-shadow: none;
  padding: 0;
}

.icon-button .v-icon {
  font-size: 24px;
}

.title {
  font-family: $font-medium;
  font-size: 14px;
}

.color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.selector {
  width: 28px;
  height: 28px;
}
</style>
