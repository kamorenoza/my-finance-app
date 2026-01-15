<template>
  <v-snackbar
    v-model="toast.show"
    :timeout="toast.timeout"
    location="top end"
    class="custom-toast"
  >
    <div :class="['custom-toast__content', toast.color]">
      <div class="custom-toast__icon">
        <SuccessIcon v-if="toast.color === ToastType.success" />
        <ErrorIcon v-if="toast.color === ToastType.error" />
        <InfoIcon v-if="toast.color === ToastType.info" />
      </div>

      <span class="custom-toast__message">{{ toast.message }}</span>
      <v-btn @click="toast.close()" class="btn-label custom-toast__close">
        <CloseIcon />
      </v-btn>
    </div>
    <!--<div :class="['toast-content', toast.color]">
      <span class="custom-toast__message">{{ toast.message }}</span>
      <v-btn icon @click="toast.close()" class="custom-toast__close"> x </v-btn>
    </div>-->
  </v-snackbar>
</template>

<script setup lang="ts">
import SuccessIcon from '@/assets/icons/Success.icon.vue'
import { useToastStore } from './toast.store'
import { ToastType } from './toast.interface'
import CloseIcon from '@/assets/icons/Close.icon.vue'
import ErrorIcon from '@/assets/icons/Error.icon.vue'
import InfoIcon from '@/assets/icons/Info.icon.vue'

const toast = useToastStore()
</script>

<style scoped lang="scss">
.custom-toast {
  &__content {
    padding: 9px 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    position: relative;

    &.success {
      background-color: $green-lg;
      border: 1.5px solid $green-md;
      border-radius: 16px;

      .custom-toast__icon {
        background-color: $green;
        width: 35px;
        height: 35px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        svg {
          width: 34px;
          height: 34px;
        }
      }
    }

    &.error {
      background-color: $red-lg;
      border: 1.5px solid $red-md;
      border-radius: 16px;

      .custom-toast__icon {
        background-color: $red;
        width: 35px;
        height: 35px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        svg {
          width: 30px;
          height: 30px;
        }
      }
    }

    &.info {
      background-color: $blue-lg;
      border: 1.5px solid $blue-md;
      border-radius: 16px;

      .custom-toast__icon {
        background-color: $blue;
        width: 35px;
        height: 35px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        svg {
          width: 34px;
          height: 34px;
        }
      }
    }
  }

  &__message {
    color: $text-dark;
  }

  &__close {
    position: absolute;
    right: 5px;
    padding: 0;
    width: 35px !important;
    min-width: 0 !important;
  }
}
</style>
