<script setup lang="ts">
import logo from '@/assets/logo.png'
</script>

<template>
  <nav data-reveal="nav" class="grid grid-cols-[1fr_auto_1fr] items-center py-8 opacity-0">
    <a href="#top" class="col-start-2 col-end-3 flex items-center justify-self-center gap-4">
      <img
        :src="logo"
        alt="Luster logo"
        class="h-9 w-9 [image-rendering:pixelated] invert"
      >
      <span class="-translate-y-0.5 font-mono text-[34px] leading-none text-[rgba(242,242,244,0.5)]">×</span>
      <span class="font-hand text-3xl tracking-wide">Luster</span>
    </a>
  </nav>
</template>
