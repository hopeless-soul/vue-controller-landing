<script setup lang="ts">
defineProps<{ label: string; heading?: string }>()
</script>

<template>
  <div class="flex w-full flex-col items-center gap-[14px] text-center">
    <div class="font-mono text-xl uppercase tracking-[4px] text-[rgba(242,242,244,0.4)]">
      {{ label }}
    </div>
    <h2 v-if="heading" class="m-0 text-[44px] font-bold leading-[66px] tracking-[-1px] text-[#f2f2f4]">
      {{ heading }}
    </h2>
  </div>
</template>
