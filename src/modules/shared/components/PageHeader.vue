<template>
  <div class="page-header" :class="{ 'page-header--with-back': showBack }">
    <v-btn
      v-if="showBack"
      icon
      size="small"
      variant="text"
      @click="handleBack"
      class="page-header__back"
    >
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>
    <div class="page-header__title-wrapper">
      <h1 v-if="title" class="page-header__title">{{ title }}</h1>
      <slot name="subtitle"></slot>
    </div>
    <div class="page-header__actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  showBack?: boolean
}

interface Emits {
  (e: 'back'): void
}

withDefaults(defineProps<Props>(), {
  title: '',
  showBack: false
})

const emit = defineEmits<Emits>()

const handleBack = () => {
  emit('back')
}
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 15px 20px;

  @media (min-width: 960px) {
    padding-left: 0;
    padding-bottom: 25px;
  }

  &--with-back {
    padding-left: 5px;
    padding-bottom: 10px;
    gap: 0;
  }

  &__back {
    flex-shrink: 0;
  }

  &__title-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__title {
    font-family: $font-medium !important;
    font-size: 16px !important;
    margin: 0;
    font-weight: 100 !important;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 15px;
  }
}
</style>
