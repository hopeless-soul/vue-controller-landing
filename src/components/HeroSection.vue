<script setup lang="ts">
import { useTemplateRef } from 'vue'
import ProductSpinner from './ProductSpinner.vue'

const spinnerRef = useTemplateRef('spinner')

defineExpose({
  playIntroSpin: () => spinnerRef.value?.playIntroSpin(),
})
</script>

<template>
  <section id="top" class="grid grid-cols-1 justify-items-center px-0 pt-[80px] text-center">
    <h1 class="m-0 uppercase">
      <p
        data-hero-word
        class="inline-block text-5xl font-bold leading-[0.95] tracking-[-1px] opacity-0 lg:text-7xl"
      >
        Your controller
      </p>
      <br />
      <p
        data-hero-word
        class="inline-block bg-linear-to-r from-[#8a8a92] via-white via-40% to-[#e8e8ec] bg-clip-text text-8xl font-bold leading-[0.95] tracking-[-2px] text-transparent opacity-0 lg:text-[128px]"
      >
        Chromed.
      </p>
    </h1>
    <p
      data-reveal="sub"
      class="m-0 max-w-[520px] pt-[23px] pb-[1px] text-lg leading-[1.55] text-[rgba(242,242,244,0.62)] opacity-0"
    >
      A hand-finished steel grill that goes over your controller in seconds — mirror-polished,
      feather-light, zero compromise.
    </p>
    <div class="relative w-full pt-[112px]">
      <ProductSpinner ref="spinner" class="w-full" />
      <div
        class="absolute bottom-0 left-1/2 flex h-[61px] w-[503px] max-w-[90%] -translate-x-1/2 items-center justify-center bg-[#c5c5c5]"
      >
        <span
          class="font-mono text-[15px] uppercase tracking-[4px] text-black"
          style="font-variation-settings: 'BLED' 0, 'SCAN' 0"
        >
          [ 360° INSPECT ]
        </span>
      </div>
    </div>
  </section>
</template>
