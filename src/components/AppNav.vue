<script setup lang="ts">
import logo from '@/assets/logo.png'
</script>

<template>
  <nav data-reveal="nav" class="flex items-center justify-center pt-8 pb-4 opacity-0">
    <a href="#top" class="flex items-center gap-4">
      <img :src="logo" alt="hk logo" class="h-[10px] w-[24px] [image-rendering:pixelated] invert" />
      <span class="font-mono text-[12px] leading-4 text-[rgba(242,242,244,0.5)]">✕</span>
      <span class="font-hand text-[16px] leading-8 tracking-[0.75px] text-[#F2F2F4]"
        >3d customs</span
      >
    </a>
  </nav>
</template>
