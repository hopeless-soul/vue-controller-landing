<script setup lang="ts">
import FaqItem from './FaqItem.vue'

interface FaqEntry {
  question: string
  body?: string
}

const FAQS: FaqEntry[] = [
  {
    question: 'How can I track the shipping status of my physical purchase?',
    body: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.",
  },
  {
    question: 'What is it made of?',
    body: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.",
  },
  {
    question: 'Shipping & delivery',
    body: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.",
  },
  {
    question: 'Puprchases and payment',
    body: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.",
  },
]
</script>

<template>
  <section class="flex flex-col items-start gap-[20px] p-[10px]">
    <h2 class="m-0 text-[32px] font-bold leading-[28px] tracking-[-0.3px] text-[#f2f2f4]">FAQ</h2>
    <div class="flex w-full flex-col gap-[16px]">
      <FaqItem v-for="faq in FAQS" :key="faq.question" :question="faq.question" :body="faq.body" />
    </div>
  </section>
</template>
