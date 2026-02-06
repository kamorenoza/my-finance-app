<template>
  <v-btn
    icon
    class="icon-color__button"
    :style="{ backgroundColor: colorButtonBackground, borderRadius: '50%' }"
    @click="togglePopover"
  >
    <component :is="iconSelected" :color="colorWhite" />
  </v-btn>

  <div v-if="showPopover" class="icon-color__modal">
    <v-card class="icon-color__card">
      <p class="title">Seleccione el icono</p>
      <div class="icon-color__grid">
        <v-btn
          v-for="iconOption in categoriesIcons"
          :key="iconOption.key"
          class="icon-color__icon"
          :class="{ 'icon-color__selected': iconOption.key === currentIcon }"
          @click="handleIconClick(iconOption.key)"
        >
          <component class="icon" :is="iconOption.icon" :color="textGraymd" />
        </v-btn>
      </div>

      <p class="title mb-2 mt-5">Seleccione el color</p>
      <div class="icon-color__grid">
        <v-btn
          v-for="color in colorPalette"
          class="icon-color__color"
          :style="{ background: color }"
          @click="handleColorClick(color)"
        >
        </v-btn>
      </div>

      <div class="mt-4 d-flex align-items-center justify-end">
        <v-btn @click="onClose" class="btn-label">Cerrar</v-btn>
        <v-btn
          @click="onSubmit"
          class="btn-label icon-color__submit"
          :disabled="!currentIcon || !colorButtonBackground"
        >
          Aceptar
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { categoryIcons, colorPalette, getIcon } from '../categories.constants'
import { colorWhite, textGraymd } from '@/styles/variables.styles'

interface Props {
  icon: string
  backgroundColor: string
}

const emit = defineEmits(['done'])
const props = defineProps<Props>()

const showPopover = ref(false)
const categoriesIcons = ref(categoryIcons)
const colorButtonBackground = ref(props.backgroundColor)
const colorIcon = ref('#ffffff')
const currentIcon = ref(props.icon)

const iconSelected = computed(() => {
  console.log(currentIcon.value)
  if (!currentIcon.value) return getIcon('cat1')
  return getIcon(currentIcon.value)
})

watch(
  () => [props.icon, props.backgroundColor, '#ffffff'],
  ([newIcon, newBg, newIconColor]) => {
    currentIcon.value = newIcon
    colorButtonBackground.value = newBg
    colorIcon.value = newIconColor
  }
)

const togglePopover = () => {
  showPopover.value = !showPopover.value
}

const handleIconClick = (iconKey: string) => {
  currentIcon.value = iconKey
}

const handleColorClick = (color: string) => {
  colorButtonBackground.value = color
}

const onSubmit = () => {
  showPopover.value = false
  emit('done', {
    icon: currentIcon.value,
    backgroundColor: colorButtonBackground.value,
    iconColor: colorIcon.value
  })
}

const onClose = () => {
  showPopover.value = false
}
</script>

<style scoped lang="scss">
.icon-color {
  &__button {
    width: 40px;
    height: 40px;
    border-radius: 12px !important;
    box-shadow: none;
    display: flex;
    align-items: center;
    justify-content: center;

    .icon {
      width: 30px;
      height: 30px;
    }
  }

  &__modal {
    position: absolute;
    top: 135px;
    left: 170px;
    transform: translateX(-50%);
    z-index: 999;
    width: 330px;
    background-color: $white;
    padding: 15px;
    box-shadow:
      0px 12px 32px rgba(0, 0, 0, 0.12),
      0px 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 24px;
  }

  &__card {
    box-shadow: none !important;
  }

  &__grid {
    display: flex;
    flex-wrap: wrap;
    column-gap: 11px;
    row-gap: 10px;
    padding-top: 10px;
  }

  &__icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    background-color: $bg-general;
    box-shadow: none;
    padding: 0;
    min-width: 0;
  }

  &__color {
    box-shadow: none;
    width: 30px;
    min-width: 0;
    height: 30px;
    padding: 0 !important;
  }

  &__selected {
    background-color: rgba($color-secondary, 0.5);
  }

  &__submit {
    color: $color-primary;
  }

  .icon,
  .this-icon {
    width: 25px !important;
    height: 25px !important;
  }
}

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
