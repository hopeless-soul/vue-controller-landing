<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'
import StarfieldBackground from './components/StarfieldBackground.vue'
import AppNav from './components/AppNav.vue'
import HeroSection from './components/HeroSection.vue'
import FeatureCard from './components/FeatureCard.vue'
import PreorderSection from './components/PreorderSection.vue'
import AppFooter from './components/AppFooter.vue'
import { FEATURES } from './content/features'
import { useIntroTimeline } from './composables/useIntroTimeline'
import { useScrollReveal } from './composables/useScrollReveal'

const heroRef = useTemplateRef('hero')
const featuresHeadingRef = useScrollReveal()

const { play } = useIntroTimeline(() => heroRef.value?.playIntroSpin())

onMounted(() => play())
</script>

<template>
  <div class="relative min-h-screen overflow-hidden">
    <StarfieldBackground />
    <div class="relative z-10 mx-auto max-w-[1200px] px-8">
      <AppNav />
      <HeroSection ref="hero" />

      <section id="features" class="px-0 pb-16 pt-[200px]">
        <div ref="featuresHeadingRef" class="text-center opacity-0">
          <div
            class="mb-3.5 font-mono text-xl uppercase tracking-[4px] text-[rgba(242,242,244,0.4)]"
          >
            [ SPEC SHEET ]
          </div>
          <h2 class="m-0 mb-16 text-[clamp(28px,4vw,44px)] font-bold tracking-[-1px]">
            Built different
          </h2>
        </div>
        <div class="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
          <FeatureCard
            v-for="(feature, index) in FEATURES"
            :key="feature.title"
            :feature="feature"
            :index="index"
          />
        </div>
      </section>

      <PreorderSection />
      <AppFooter />
    </div>
  </div>
</template>
