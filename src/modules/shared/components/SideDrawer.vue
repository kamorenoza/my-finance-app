<template>
  <Transition name="side-drawer">
    <div v-if="modelValue" class="side-drawer" @click.self="onOverlayClick">
      <div class="side-drawer__panel" :style="{ width: width + 'px' }">
        <div v-if="title" class="side-drawer__header">
          <v-btn
            icon
            size="small"
            variant="text"
            @click="emit('update:modelValue', false)"
            class="side-drawer__back"
          >
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <span class="side-drawer__title">{{ title }}</span>
        </div>
        <div class="side-drawer__content">
          <slot />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  width?: number
  persistent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  width: 380,
  persistent: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const onOverlayClick = () => {
  if (!props.persistent) {
    emit('update:modelValue', false)
  }
}
</script>

<style lang="scss">
.side-drawer {
  position: fixed;
  inset: 0;
  z-index: 2400;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: flex-end;

  &__panel {
    background-color: $white;
    height: 100%;
    max-width: 100vw;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 12px 12px 16px 8px;
    flex-shrink: 0;
  }

  &__back {
    flex-shrink: 0;
  }

  &__title {
    font-family: $font-medium;
    font-size: 0.95rem;
    color: $text-gray;
  }

  &__content {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
}

/* Transition */
.side-drawer-enter-active,
.side-drawer-leave-active {
  transition: opacity 0.2s ease;

  .side-drawer__panel {
    transition: transform 0.25s ease;
  }
}

.side-drawer-enter-from,
.side-drawer-leave-to {
  opacity: 0;

  .side-drawer__panel {
    transform: translateX(100%);
  }
}

.side-drawer-enter-to,
.side-drawer-leave-from {
  opacity: 1;

  .side-drawer__panel {
    transform: translateX(0);
  }
}
</style>
