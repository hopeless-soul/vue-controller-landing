<script setup lang="ts">
import logo from '@/assets/logo.png'

const socialLinks = ['Instagram', 'TikTok', 'X', 'Discord']
</script>

<template>
  <footer
    class="flex h-[56px] w-full max-w-[1200px] flex-wrap items-center justify-between gap-5 border-t border-white/[0.08] px-0 py-[16px]"
  >
    <div class="flex h-[24px] items-center gap-[10px]">
      <img :src="logo" alt="" class="h-[12px] w-[28px] [image-rendering:pixelated] invert" />
      <span class="font-mono text-[16px] leading-[16px] text-[rgba(242,242,244,0.5)]">✕</span>
      <span class="font-hand text-[16px] leading-[24px] text-[rgba(242,242,244,0.7)]">3d Customs</span>
      <span class="font-mono text-[15px] leading-[22.5px] text-[rgba(242,242,244,0.3)]">© 2026</span>
    </div>
    <div class="flex h-[24px] gap-[24px]">
      <a
        v-for="link in socialLinks"
        :key="link"
        href="#"
        class="text-[14px] leading-[20px] text-[rgba(242,242,244,0.55)] hover:text-white"
        >{{ link }}</a
      >
    </div>
  </footer>
</template>
