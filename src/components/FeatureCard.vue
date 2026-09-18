<script setup lang="ts">
import type { Feature } from '@/content/features'
import { useScrollReveal } from '@/composables/useScrollReveal'

const props = defineProps<{ feature: Feature; index: number }>()

const revealTarget = useScrollReveal(props.index * 110)
</script>

<template>
  <div
    ref="revealTarget"
    data-reveal="card"
    class="flex flex-col gap-[16px] rounded-[20px] border border-white/[0.08] bg-gradient-to-b from-white/[0.055] to-[#17171a] p-[37px] opacity-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_24px_48px_-20px_rgba(0,0,0,0.7)] transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_32px_64px_-20px_rgba(0,0,0,0.85)]"
  >
    <div class="flex items-baseline justify-between">
      <span class="font-mono text-sm tracking-[2px] text-[rgba(242,242,244,0.35)]">{{ feature.tag }}</span>
    </div>
    <div class="text-[32px] font-bold tracking-[-0.3px]">{{ feature.title }}</div>
    <p class="m-0 text-[15px] leading-[1.6] text-[rgba(242,242,244,0.6)]">{{ feature.description }}</p>
  </div>
</template>
