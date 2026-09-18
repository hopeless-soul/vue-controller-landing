<script setup lang="ts">
import bokiagepTarget from '@/assets/bokiagep-target.png'

const TARGET_COUNT = 5
</script>

<template>
  <section class="flex items-start justify-center gap-[98px] pt-[120px]">
    <img
      v-for="n in TARGET_COUNT"
      :key="n"
      :src="bokiagepTarget"
      alt=""
      class="h-[56px] w-[56px]"
      aria-hidden="true"
    />
  </section>
</template>
