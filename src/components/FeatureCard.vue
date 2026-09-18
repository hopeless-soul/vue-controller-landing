<script setup lang="ts">
import type { Feature } from '@/content/features'
import { useScrollReveal } from '@/composables/useScrollReveal'

const props = defineProps<{ feature: Feature; index: number }>()

const revealTarget = useScrollReveal(props.index * 110)
</script>

<template>
  <div ref="revealTarget" data-reveal="card" class="flex flex-col gap-[16px] opacity-0">
    <span class="font-mono text-sm tracking-[2px] text-[rgba(242,242,244,0.35)]">{{ feature.tag }}</span>
    <div class="text-[32px] font-bold tracking-[-0.3px]">{{ feature.title }}</div>
    <p class="m-0 text-[15px] leading-[1.6] text-[rgba(242,242,244,0.6)]">{{ feature.description }}</p>
  </div>
</template>
