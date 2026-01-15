<template>
  <v-card class="normal-card">
    <div class="normal-card__header">
      <div class="normal-card__icon">
        <SuitcaseIcon />
      </div>

      <div>
        <h3 class="normal-card__title">{{ account.name }}</h3>
        <p class="normal-card__type">{{ type }}</p>
      </div>
    </div>

    <div class="normal-card__balance">
      <div class="normal-card__label">Saldo</div>
      <div
        v-currency-formatter="account.balance"
        class="normal-card__value"
      ></div>
    </div>

    <div class="normal-card__fixed">
      <span class="normal-card__label">Saldo real</span>
      <span
        class="normal-card__fixed-label"
        v-currency-formatter="account.initialValue"
      >
      </span>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import SuitcaseIcon from '@/assets/icons/Suitcase.icon.vue'
import { type Account } from '../accounts.interface'
import { computed } from 'vue'
import { AccountTypes } from '../accounts.constants'

interface Props {
  account: Account
}

const props = defineProps<Props>()

const type = computed(() => {
  if (props.account.type === AccountTypes.normal) {
    return 'Ahorros'
  } else if (props.account.type === AccountTypes.TC) {
    return 'Tarjeta de crédito'
  } else {
    return 'Préstamo'
  }
})
</script>

<style scoped lang="scss">
.normal-card {
  background-color: $card-green-lg;
  padding: 15px;
  border-radius: 16px;
  box-shadow: none;

  &__header {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  &__icon {
    background-color: $card-green-md;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    width: 45px;
    height: 45px;
    margin-right: 3px;

    .icon {
      width: 38px;
      height: 38px;
    }
  }

  &__title {
    text-transform: capitalize;
    line-height: 16px;
  }

  &__balance {
    margin-top: 20px;
  }

  &__label {
    font-size: 13px;
    color: $text-gray-md;
    line-height: 13px;
  }

  &__value {
    font-size: 20px;
    font-family: $font-medium;
  }

  &__fixed {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 15px;
  }

  &__fixed-label {
    font-size: 13px;
    color: $text-gray-md;
    line-height: 13px;
    font-family: $font-medium;
  }

  &__type {
    font-size: 11px;
    line-height: 11px;
    color: $text-gray-md;
    margin-top: 4px;
  }
}
</style>
