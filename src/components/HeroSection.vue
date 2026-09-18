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
        class="inline-block font-sans text-[92px] font-bold leading-[0.95] tracking-[-1px] text-[#F2F2F4] opacity-0"
      >
        Your controller
      </p>
      <br />
      <p
        data-hero-word
        class="inline-block bg-clip-text text-[184px] font-bold leading-[0.95] tracking-[-2px] text-transparent opacity-0"
        style="background-image: linear-gradient(180deg, #b5b5b6 20%, #ffffff 41%, #6b6b6e 55%, #1a1a1c 67%, #ffffff 100%)"
      >
        Chromed.
      </p>
    </h1>
    <p
      data-reveal="sub"
      class="m-0 max-w-[520px] pt-[24px] pb-[1px] font-sans text-[18px] leading-[28px] text-[rgba(242,242,244,0.62)] opacity-0"
    >
      A hand-finished steel grill that goes over your controller in seconds — mirror-polished,
      feather-light, zero compromise.
    </p>
    <div class="relative w-full pt-[112px]">
      <ProductSpinner ref="spinner" class="w-full" />
      <div
        class="absolute bottom-0 left-1/2 flex h-[64px] w-[500px] max-w-[90%] -translate-x-1/2 items-center justify-center bg-[#c5c5c5]"
      >
        <span
          class="font-mono text-[15px] leading-[28px] uppercase tracking-[4px] text-black"
          style="font-variation-settings: 'BLED' 0, 'SCAN' 0"
        >
          [ 360° INSPECT ]
        </span>
      </div>
    </div>
  </section>
</template>
