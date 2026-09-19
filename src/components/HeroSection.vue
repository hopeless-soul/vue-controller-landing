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
        class="inline-block font-sans text-[84px] font-bold leading-[0.95] tracking-[-0.9px] text-[#F2F2F4] opacity-0"
      >
        Your controller
      </p>
      <br />
      <p
        data-hero-word
        class="inline-block bg-clip-text text-[168px] font-bold leading-[0.95] tracking-[-1.8px] text-transparent opacity-0"
        style="
          background-image: linear-gradient(
            180deg,
            #b5b5b6 20%,
            #ffffff 41%,
            #6b6b6e 55%,
            #1a1a1c 67%,
            #ffffff 100%
          );
          filter: url(#chrome-text-inner-shadow);
        "
      >
        Chromed.
      </p>
    </h1>
    <svg width="0" height="0" class="absolute" aria-hidden="true">
      <defs>
        <filter id="chrome-text-inner-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur1" />
          <feOffset in="blur1" dx="0" dy="-1" result="offset1" />
          <feComposite in="SourceGraphic" in2="offset1" operator="out" result="inverse1" />
          <feFlood flood-color="#000000" flood-opacity="0.52" result="color1" />
          <feComposite in="color1" in2="inverse1" operator="in" result="shadow1" />
          <feComposite in="shadow1" in2="SourceGraphic" operator="over" result="with-shadow" />

          <feGaussianBlur in="SourceAlpha" stdDeviation="4.4" result="blur2" />
          <feOffset in="blur2" dx="0" dy="-1" result="offset2" />
          <feComposite in="SourceGraphic" in2="offset2" operator="out" result="inverse2" />
          <feFlood flood-color="#ffffff" flood-opacity="1" result="color2" />
          <feComposite in="color2" in2="inverse2" operator="in" result="glow2" />
          <feComposite in="glow2" in2="with-shadow" operator="over" />
        </filter>
      </defs>
    </svg>
    <p
      data-reveal="sub"
      class="m-0 max-w-[520px] pt-[24px] pb-[1px] font-sans text-[18px] leading-[28px] text-[rgba(242,242,244,0.62)] opacity-0"
    >
      A hand-finished steel grill that goes over your controller in seconds — mirror-polished,
      feather-light, zero compromise.
    </p>
    <div class="relative w-full pt-[112px]">
      <div
        class="absolute bottom-0 left-1/2 -translate-x-1/2 -translate-y-[112px] flex h-[64px] w-[500px] max-w-[90%] items-center justify-center bg-[#c5c5c5]"
      >
        <span
          class="font-mono text-[15px] leading-7 uppercase tracking-[4px] text-black"
          style="
            font-variation-settings:
              'BLED' 0,
              'SCAN' 0;
          "
        >
          [ 360° INSPECT ]
        </span>
      </div>
      <ProductSpinner ref="spinner" class="w-full" />
    </div>
  </section>
</template>
