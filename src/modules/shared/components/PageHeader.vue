<template>
  <div class="page-header">
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
    <h1 v-if="title" class="page-header__title">{{ title }}</h1>
    <slot name="actions"></slot>
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

  &__back {
    flex-shrink: 0;
  }

  &__title {
    font-family: $font-medium !important;
    font-size: 16px !important;
    margin: 0;
    flex: 1;
    font-weight: 100 !important;
  }
}
</style>
