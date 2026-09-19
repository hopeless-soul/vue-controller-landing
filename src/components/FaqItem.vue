<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ question: string; body?: string }>()
const isOpen = ref(false)

function toggle() {
  if (!props.body) return
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="w-full border-b border-[rgba(153,153,153,0.6)] pb-[2px]">
    <button
      type="button"
      class="flex w-full items-start justify-between gap-4 py-[6px] text-left"
      :class="body ? 'cursor-pointer' : 'cursor-default'"
      @click="toggle"
    >
      <span class="text-[15px] text-[rgba(242,242,244,0.6)]">{{ question }}</span>
      <svg
        v-if="body"
        class="mt-[2px] h-6 w-6 shrink-0 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
    <div
      v-if="body"
      class="grid transition-[grid-template-rows] duration-300 ease-in-out"
      :style="{ gridTemplateRows: isOpen ? '1fr' : '0fr' }"
    >
      <div class="overflow-hidden">
        <p
          class="m-0 max-w-[1042px] pb-[8px] text-[15px] leading-[1.6] text-[rgba(242,242,244,0.33)] transition-opacity duration-200 ease-in-out"
          :class="isOpen ? 'opacity-100' : 'opacity-0'"
        >
          {{ body }}
        </p>
      </div>
    </div>
  </div>
</template>
