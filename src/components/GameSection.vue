<script setup lang="ts">
import { onUnmounted, type ComponentPublicInstance } from 'vue'
import tankSprite from '@/assets/tank.png'
import { useTankControls } from '@/composables/useTankControls'
import { useInViewport } from '@/composables/useInViewport'

const TANK_WIDTH = 57
const PROJECTILE_TRAVEL_MS = 900

const { target: viewportTarget, isInViewport } = useInViewport()

function setViewportTarget(el: Element | ComponentPublicInstance | null) {
  viewportTarget.value = el as HTMLElement | null
}
const { trackRef, tankX, projectiles, onPointerMove, onPointerDown, removeProjectile } =
  useTankControls({
    tankWidth: TANK_WIDTH,
    canFire: () => isInViewport.value,
  })

const pendingTimeouts = new Set<number>()

function handleFire(event: PointerEvent) {
  const before = projectiles.value.length
  onPointerDown(event)
  if (projectiles.value.length > before) {
    const spawned = projectiles.value[projectiles.value.length - 1]!
    const timeoutId = window.setTimeout(() => {
      pendingTimeouts.delete(timeoutId)
      removeProjectile(spawned.id)
    }, PROJECTILE_TRAVEL_MS)
    pendingTimeouts.add(timeoutId)
  }
}

onUnmounted(() => {
  pendingTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId))
  pendingTimeouts.clear()
})
</script>

<template>
  <section
    :ref="setViewportTarget"
    class="flex items-center justify-center"
  >
    <div
      ref="trackRef"
      class="relative flex h-[50px] w-full max-w-[494px] items-center py-[10px]"
      @pointermove="onPointerMove"
      @pointerdown="handleFire"
    >
      <div
        v-for="projectile in projectiles"
        :key="projectile.id"
        class="pointer-events-none absolute bottom-full h-[10px] w-[3px] -translate-x-1/2 rounded-full bg-white transition-transform ease-linear"
        :style="{
          left: `${projectile.x}px`,
          transitionDuration: `${PROJECTILE_TRAVEL_MS}ms`,
          transform: projectile.launched ? 'translate(-50%, -400px)' : 'translate(-50%, 0)',
        }"
      />
      <img
        :src="tankSprite"
        alt=""
        aria-hidden="true"
        class="absolute h-[30px] w-[57px]"
        :style="{ left: `${tankX}px` }"
      />
    </div>
  </section>
</template>
