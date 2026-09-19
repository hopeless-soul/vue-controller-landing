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
    class="flex w-[491px] max-w-full flex-col gap-[16px] px-[37px] pt-[16px] pb-[37px] opacity-0"
  >
    <span class="font-mono text-sm leading-[28px] tracking-[2px] text-[rgba(242,242,244,0.35)]">{{
      feature.tag
    }}</span>
    <div class="font-sans text-[32px] leading-[28px] font-bold tracking-[-0.3px] text-[#F2F2F4]">
      {{ feature.title }}
    </div>
    <p class="m-0 font-sans text-[15px] leading-[24px] text-[rgba(242,242,244,0.6)]">
      {{ feature.description }}
    </p>
  </div>
</template>
