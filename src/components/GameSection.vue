<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import tankSprite from '@/assets/tank.png'
import { useTankControls } from '@/composables/useTankControls'
import { useInViewport } from '@/composables/useInViewport'

const TANK_WIDTH = 57
const PROJECTILE_TRAVEL_MS = 900

const { target: viewportTarget, isInViewport } = useInViewport()

function setViewportTarget(el: Element | ComponentPublicInstance | null) {
  viewportTarget.value = el as HTMLElement | null
}

const { trackRef, tankX, projectiles } = useTankControls({
  tankWidth: TANK_WIDTH,
  isActive: () => isInViewport.value,
  projectileTravelMs: PROJECTILE_TRAVEL_MS,
})
</script>

<template>
  <section :ref="setViewportTarget" class="flex items-center justify-center">
    <div ref="trackRef" class="relative flex h-[50px] w-full items-center py-[10px]">
      <div
        v-for="projectile in projectiles"
        :key="projectile.id"
        class="pointer-events-none absolute bottom-full h-[10px] w-[3px] -translate-x-1/2 rounded-full bg-white transition-[transform,opacity] ease-linear"
        :style="{
          left: `${projectile.x}px`,
          transitionDuration: `${PROJECTILE_TRAVEL_MS}ms`,
          transform: projectile.launched ? 'translate(-50%, -400px)' : 'translate(-50%, 0)',
          opacity: projectile.launched ? 0 : 1,
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
