<script setup lang="ts">
import packagingPreview from '@/assets/packaging-preview.png'
import SectionHeading from './SectionHeading.vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

const revealTarget = useScrollReveal()
</script>

<template>
  <section class="flex flex-col items-center justify-center gap-[10px] pt-[120px]">
    <SectionHeading label="[ PACKAGING ]" />
    <div ref="revealTarget" class="flex flex-col items-center opacity-0">
      <img
        :src="packagingPreview"
        alt="3d Customs packaging"
        width="693"
        height="348"
        class="w-full max-w-[693px]"
      />
      <p class="max-w-[420px] pt-[4px] pb-[22px] text-center font-sans text-[17px] leading-[26px] text-[rgba(242,242,244,0.6)]">
        Hand-finished, laser-precision engineered packaging that transforms unboxing into ritual.
      </p>
    </div>
  </section>
</template>
