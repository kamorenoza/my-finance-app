<template>
  <v-menu
    v-model="menu"
    location="bottom end"
    :close-on-content-click="false"
    v-if="items?.length && items.length > 0"
  >
    <template #activator="{ props }">
      <v-btn
        icon
        variant="plain"
        v-bind="props"
        :ripple="false"
        class="btn-label dot-menu__button"
      >
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </template>

    <v-card class="dot-menu__card">
      <div
        class="dot-menu__item"
        v-for="item in props.items"
        :key="item.label"
        @click="onClickItem(item)"
      >
        {{ item.label }}
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  items?: Array<{ label: string; id: number }>
}>()

const emit = defineEmits<{
  (e: 'onMenuClicked', id: number): void
}>()

const menu = ref(false)

const onClickItem = (item: { label: string; id: number }) => {
  menu.value = false
  emit('onMenuClicked', item.id)
}
</script>

<style scoped lang="scss">
.dot-menu {
  width: 20px;

  &__button {
    max-width: 20px;
  }

  &__card {
    padding: 8px;
    width: 200px;
  }

  &__item {
    padding: 6px 12px;
    font-size: 14px;
    cursor: pointer;

    &:hover {
      background-color: $bg-general;
    }
  }

  @media (min-width: 960px) {
    width: 40px;
  }
}
</style>
