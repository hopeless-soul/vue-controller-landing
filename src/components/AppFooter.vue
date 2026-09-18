<script setup lang="ts">
import logo from '@/assets/logo.png'

const socialLinks = ['Instagram', 'TikTok', 'X', 'Discord']
</script>

<template>
  <footer
    class="flex flex-wrap items-center justify-between gap-5 border-t border-white/[0.08] px-0 pb-11 pt-9"
  >
    <div class="flex items-center gap-2.5">
      <img :src="logo" alt="" class="h-[12px] [image-rendering:pixelated] invert" />
      <span class="translate-y-0.5 font-mono text-[16px] leading-none text-[rgba(242,242,244,0.5)]"
        >✕</span
      >
      <span class="font-hand text-base text-[rgba(242,242,244,0.7)]">3d Customs</span>
      <span class="font-mono text-[15px] text-[rgba(242,242,244,0.3)]">© 2026</span>
    </div>
    <div class="flex gap-6 text-sm">
      <a
        v-for="link in socialLinks"
        :key="link"
        href="#"
        class="text-[rgba(242,242,244,0.55)] hover:text-white"
        >{{ link }}</a
      >
    </div>
  </footer>
</template>
