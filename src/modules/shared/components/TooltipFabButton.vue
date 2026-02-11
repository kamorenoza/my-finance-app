<template>
  <v-tooltip
    v-model="tooltipVisible"
    :text="tooltip"
    location="left"
    :open-on-hover="false"
    :open-on-focus="false"
    :open-on-click="false"
  >
    <template v-slot:activator="{ props: tooltipProps }">
      <v-btn
        :color="color"
        class="btn-fab fab-button"
        :class="buttonClass"
        @click="handlePress"
        @pointerdown="onPointerDown"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @pointerleave="onPointerLeave"
        @pointerenter="onPointerEnter"
        v-bind="tooltipProps"
      >
        <slot name="icon" />
      </v-btn>
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  tooltip: string
  color?: string
  buttonClass?: string | string[] | Record<string, boolean>
}

withDefaults(defineProps<Props>(), {
  color: undefined,
  buttonClass: undefined
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

const tooltipVisible = ref(false)
const isLongPress = ref(false)
let longPressResetTimeout: ReturnType<typeof setTimeout> | null = null
let longPressTimeout: ReturnType<typeof setTimeout> | null = null
let tooltipAutoHideTimeout: ReturnType<typeof setTimeout> | null = null

const showTooltip = (fromTouch = false) => {
  tooltipVisible.value = true
  if (fromTouch) {
    isLongPress.value = true
    if (tooltipAutoHideTimeout) {
      clearTimeout(tooltipAutoHideTimeout)
    }
    tooltipAutoHideTimeout = setTimeout(() => {
      hideTooltip()
    }, 1500)
  } else if (tooltipAutoHideTimeout) {
    clearTimeout(tooltipAutoHideTimeout)
  }
}

const hideTooltip = () => {
  tooltipVisible.value = false
  if (tooltipAutoHideTimeout) {
    clearTimeout(tooltipAutoHideTimeout)
  }
  if (longPressResetTimeout) {
    clearTimeout(longPressResetTimeout)
  }
  longPressResetTimeout = setTimeout(() => {
    isLongPress.value = false
  }, 300)
}

const startLongPress = () => {
  if (longPressTimeout) {
    clearTimeout(longPressTimeout)
  }
  longPressTimeout = setTimeout(() => {
    showTooltip(true)
  }, 500)
}

const endLongPress = () => {
  if (longPressTimeout) {
    clearTimeout(longPressTimeout)
  }
  if (isLongPress.value) {
    hideTooltip()
  }
}

const onPointerDown = (event: PointerEvent) => {
  if (event.pointerType === 'touch') {
    startLongPress()
  }
}

const onPointerEnter = (event: PointerEvent) => {
  if (event.pointerType === 'mouse') {
    showTooltip(false)
  }
}

const onPointerUp = (event: PointerEvent) => {
  if (event.pointerType === 'touch') {
    endLongPress()
  } else if (event.pointerType === 'mouse') {
    hideTooltip()
  }
}

const onPointerLeave = (event: PointerEvent) => {
  if (event.pointerType === 'mouse') {
    hideTooltip()
  } else if (event.pointerType === 'touch') {
    endLongPress()
  }
}

const handlePress = () => {
  if (isLongPress.value) {
    isLongPress.value = false
    return
  }

  emit('click')
}
</script>

<style lang="scss" scoped>
.fab-button {
  width: 40px !important;
  height: 40px !important;
  display: flex;
  align-items: center;
  justify-content: center;

  &.has-label {
    @media (min-width: 960px) {
      width: max-content !important;
      padding-left: 10px !important;
      padding-right: 10px !important;
    }
  }
}
</style>
