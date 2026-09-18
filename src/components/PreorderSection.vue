<script setup lang="ts">
import { animate } from 'animejs'
import { useScrollReveal } from '@/composables/useScrollReveal'
import SectionHeading from './SectionHeading.vue'

const revealTarget = useScrollReveal()

function onPreorder(event: MouseEvent) {
  const button = event.currentTarget as HTMLElement
  animate(button, {
    scale: [{ to: 0.92, duration: 90 }, { to: 1, duration: 350, ease: 'outElastic' }],
  })
}
</script>

<template>
  <section id="preorder" class="px-0 pt-[120px] pb-40 text-center">
    <div ref="revealTarget" class="flex flex-col items-center gap-[12.7px] opacity-0">
      <SectionHeading label="[ FIRST DROP ]" />
      <div class="pt-[65px] pb-[13px] text-[clamp(30px,5vw,52px)] font-bold leading-[1.1] tracking-[-1.5px]">
        300 units. One shot.
      </div>
      <p class="mx-auto max-w-[420px] text-[17px] leading-[1.55] text-[rgba(242,242,244,0.6)]">
        Hand-finished in small batches and gone fast. Reserve now, ships worldwide this fall.
      </p>
      <button
        type="button"
        class="cursor-pointer rounded-full border border-white/90 bg-gradient-to-b from-white via-[#d8d8de] to-[#f0f0f4] px-[49px] py-[19px] text-[17px] font-semibold tracking-[0.2px] text-[#0c0c0e] shadow-[inset_0_1px_0_#fff,0_10px_30px_-8px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.03]"
        @click="onPreorder"
      >
        Reserve — $38
      </button>
      <div class="pt-[31px] font-mono text-[17px] tracking-[0.4px] text-[rgba(247,209,56,0.9)]">
        - REFUNDABLE ANYTIME BEFORE SHIPPING -
      </div>
    </div>
  </section>
</template>
