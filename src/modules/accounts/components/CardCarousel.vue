<template>
  <div class="carousel-wrapper">
    <div class="carousel carousel--list" ref="carouselRef" tabindex="0">
      <div
        v-for="account in store.filteredAccounts"
        class="carousel__item"
        ref="cardRefs"
      >
        <NormalCard
          v-if="account.type === AccountTypes.normal"
          :account="account"
        />
        <CardCreditCard
          v-else-if="account.type === AccountTypes.TC"
          :account="account"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAccountsStore } from '../accounts.store'
import NormalCard from './NormalCard.vue'
import { AccountTypes, AccountView } from '../accounts.constants'
import CardCreditCard from './CardCreditCard.vue'

const store = useAccountsStore()

const currentIndex = ref(0)
const offset = ref(0)
const cardRefs = ref<HTMLElement[]>([] as HTMLElement[])

// Pointer (mouse / trackpad / touch) drag support for desktop
let isPointerDown = false
let pointerStartX = 0
const SWIPE_THRESHOLD = 50

const onPointerDown = (e: PointerEvent) => {
  if (e.pointerType === 'touch') return
  isPointerDown = true
  pointerStartX = e.clientX
  try {
    ;(e.target as Element)?.setPointerCapture?.(e.pointerId)
  } catch {}
}

const onPointerMove = (e: PointerEvent) => {
  if (e.pointerType === 'touch') return
  if (!isPointerDown) return
  const diff = pointerStartX - e.clientX
  if (Math.abs(diff) >= SWIPE_THRESHOLD) {
    if (diff > 0) swipeLeft()
    else swipeRight()
    isPointerDown = false
    try {
      ;(e.target as Element)?.releasePointerCapture?.(e.pointerId)
    } catch {}
  }
}

const onPointerUp = (e: PointerEvent) => {
  if (e.pointerType === 'touch') return
  if (!isPointerDown) return
  isPointerDown = false
  const diff = pointerStartX - e.clientX
  try {
    ;(e.target as Element)?.releasePointerCapture?.(e.pointerId)
  } catch {}

  // If the user dragged enough, trigger a swipe; otherwise snap to current index
  if (Math.abs(diff) >= SWIPE_THRESHOLD) {
    if (diff > 0) swipeLeft()
    else swipeRight()
  } else {
    // No swipe: ensure offset/current index is recalculated (snap back)
    updateOffset()
  }
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowLeft') swipeRight()
  if (e.key === 'ArrowRight') swipeLeft()
}

const updateOffset: any = () => {
  const el = cardRefs.value[currentIndex.value]
  if (el) {
    const wrapper = el.parentElement?.parentElement
    const wrapperWidth = wrapper?.clientWidth ?? 0
    const elOffset = el.offsetLeft
    const elWidth = el.offsetWidth

    if (currentIndex.value === 0) {
      offset.value = 0
    } else {
      offset.value = elOffset - (wrapperWidth - elWidth) / 2
    }
  }
  store.setCurrentIndexAccount(currentIndex.value)
}

const swipeLeft = () => {
  if (currentIndex.value < store.accounts.length - 1) {
    currentIndex.value = currentIndex.value + 1
  } else {
    currentIndex.value = 0
  }
  updateOffset()
}

const swipeRight = () => {
  if (currentIndex.value === 0) {
    currentIndex.value = store.accounts.length - 1
  } else {
    currentIndex.value--
  }
  updateOffset()
}

watch(
  () => store.filteredAccounts,
  () => {
    updateOffset()
  },
  { immediate: true, deep: true }
)
</script>
<style scoped lang="scss">
.carousel-wrapper {
  overflow-x: hidden;
  width: 100%;

  @media (min-width: 600px) {
    height: calc(100dvh - 220px);
    overflow-y: auto;
  }
}

.carousel {
  display: flex;
  gap: 10px;
  transition: transform 0.3s ease;
  padding-left: 15px;
  padding-top: 0px;
  min-height: 185px;
  padding-bottom: 40px;

  @media (min-width: 600px) {
    flex-wrap: wrap;
    gap: 20px;
    justify-content: flex-start !important;
    align-items: flex-start !important;
    transform: none !important;
  }

  @media (min-width: 960px) {
    padding-left: 0;
  }

  &__item {
    height: 150px;
    width: 90vw;
    flex-shrink: 0;
    scroll-snap-align: start;
    background-color: transparent !important;
    cursor: pointer;
    min-width: 270px;
    height: auto;

    @media (min-width: 600px) {
      flex: 0 1 calc((100% / 3) - 20px);
      margin-bottom: 0;
    }

    @media (min-width: 601px) {
      flex: 0 1 calc((100% / 3) - 20px);
    }

    @media (min-width: 1264px) {
      flex: 0 1 calc((100% / 4) - 20px);
    }
  }

  &__preview {
    display: block;
    padding: 15px;
    height: calc(100dvh - 385px);
    overflow-y: auto;
    padding-bottom: 65px;
    position: relative;
    padding-right: 0;

    @media (min-width: 600px) {
      display: none;
    }
  }

  &--list {
    display: block;
    overflow-y: auto;
    height: calc(100dvh - 183px);
    transform: none !important;

    @media (min-width: 600px) {
      display: flex;
      height: auto;
      flex-wrap: wrap;
      gap: 20px;
      justify-content: flex-start !important;
      align-items: flex-start !important;
      transform: none !important;
    }

    .carousel__item {
      margin-bottom: 15px;
      width: calc(100% - 15px);

      @media (min-width: 600px) {
        flex: 0 1 calc((100% / 2) - 20px);
        margin-bottom: 0;
      }

      @media (min-width: 1100px) {
        flex: 0 1 calc((100% / 3) - 20px);
      }

      @media (min-width: 1264px) {
        flex: 0 1 calc((100% / 4) - 20px);
      }
    }

    .carousel__preview {
      display: none;
    }
  }
}
</style>
