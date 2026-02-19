<template>
  <v-menu
    v-model="menu"
    location="bottom end"
    :close-on-content-click="false"
    v-if="items?.length && items.length > 0"
    :z-index="2600"
  >
    <template #activator="{ props }">
      <v-btn
        icon
        variant="plain"
        v-bind="props"
        :ripple="false"
        class="btn-label dot-menu__button"
      >
        <slot>
          <v-icon>mdi-dots-vertical</v-icon>
        </slot>
      </v-btn>
    </template>

    <div class="dot-menu__card">
      <div
        class="dot-menu__item"
        v-for="item in props.items"
        :key="item.label"
        @click="onClickItem(item)"
      >
        <component :is="item.icon" v-if="item.icon" />
        {{ item.label }}
      </div>
    </div>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  items?: Array<{ label: string; id: number; icon?: any }>
}>()

const emit = defineEmits<{
  (e: 'onMenuClicked', id: number): void
}>()

const menu = ref(false)

const onClickItem = (item: { label: string; id: number; icon?: any }) => {
  menu.value = false
  emit('onMenuClicked', item.id)
}
</script>

<style scoped lang="scss">
.dot-menu {
  width: 30px;

  &__button {
    max-width: 30px;
  }

  &__card {
    width: 200px;
    background-color: $white;
    padding: 10px;
    box-shadow:
      0px 12px 32px rgba(0, 0, 0, 0.12),
      0px 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 24px;
  }

  &__item {
    padding: 6px 12px;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;

    .icon {
      width: 18px;
      height: 18px;
      margin-bottom: 1px;
    }

    &:hover {
      background-color: $bg-general;
    }
  }

  @media (min-width: 960px) {
    width: 40px;
  }
}
</style>
