<script setup lang="ts">
import logo from '@/assets/logo.png'
</script>

<template>
  <nav data-reveal="nav" class="grid grid-cols-[1fr_auto_1fr] items-center py-8 opacity-0">
    <a href="#top" class="col-start-2 col-end-3 flex items-center justify-self-center gap-4">
      <img :src="logo" alt="hk logo" class="h-6 [image-rendering:pixelated] invert" />
      <span class="translate-y-0.5 font-mono text-[16px] leading-none text-[rgba(242,242,244,0.5)]"
        >✕</span
      >
      <span class="font-hand text-3xl tracking-wide">3d customs</span>
    </a>
  </nav>
</template>
