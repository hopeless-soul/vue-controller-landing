<script setup lang="ts">
import { useTemplateRef } from 'vue'
import ProductSpinner from './ProductSpinner.vue'

const spinnerRef = useTemplateRef('spinner')

defineExpose({
  playIntroSpin: () => spinnerRef.value?.playIntroSpin(),
})
</script>

<template>
  <section
    id="top"
    class="grid grid-cols-1 justify-items-center px-0 pb-8 pt-12 text-center"
  >
    <h1 class="m-0 max-w-[820px] text-[clamp(44px,7vw,84px)] font-bold leading-[1.02] tracking-[-2px]">
      <span data-hero-word class="inline-block opacity-0">Your</span> <span data-hero-word class="inline-block opacity-0">controller.</span>
      <span
        data-hero-word
        class="inline-block bg-gradient-to-r from-[#8a8a92] via-white via-40% to-[#e8e8ec] bg-clip-text text-transparent opacity-0"
      >Reflected.</span>
    </h1>
    <p
      data-reveal="sub"
      class="m-0 mt-6 max-w-[520px] text-lg leading-[1.55] text-[rgba(242,242,244,0.62)] opacity-0"
    >
      A hand-finished chrome shell that snaps over your controller in seconds — mirror-polished,
      feather-light, zero compromise.
    </p>
    <ProductSpinner ref="spinner" class="mt-10 w-full" />
  </section>
</template>
