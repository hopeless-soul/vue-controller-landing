<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useSpinner } from '@/composables/useSpinner'
import { CONTROLLER_FRAMES } from '@/content/controllerFrames'

const imgRef = useTemplateRef('image')
const { onPointerDown, playIntroSpin } = useSpinner(imgRef, CONTROLLER_FRAMES)

defineExpose({ playIntroSpin })
</script>

<template>
  <div
    data-spin-stage
    class="mx-auto flex aspect-square w-full max-w-[420px] cursor-grab touch-none select-none items-center justify-center opacity-0"
    @pointerdown="onPointerDown"
  >
    <img
      ref="image"
      :src="CONTROLLER_FRAMES[0]"
      alt="Luster chrome controller shell, rotating product view"
      draggable="false"
      class="pointer-events-none w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
    >
  </div>
</template>
