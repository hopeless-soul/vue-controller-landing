<script setup lang="ts">
import logo from '@/assets/logo.png'
</script>

<template>
  <nav data-reveal="nav" class="flex items-center justify-center px-[42px] pt-[32px] pb-[16px] opacity-0">
    <a href="#top" class="flex items-center gap-[16px]">
      <img :src="logo" alt="hk logo" class="h-6 [image-rendering:pixelated] invert" />
      <span class="translate-y-0.5 font-mono text-[16px] leading-none text-[rgba(242,242,244,0.5)]"
        >✕</span
      >
      <span class="font-hand text-3xl tracking-wide">3d customs</span>
    </a>
  </nav>
</template>
