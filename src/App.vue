<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'
import StarfieldBackground from './components/StarfieldBackground.vue'
import AppNav from './components/AppNav.vue'
import HeroSection from './components/HeroSection.vue'
import SectionHeading from './components/SectionHeading.vue'
import FeatureCard from './components/FeatureCard.vue'
import assemblyTransparent from './assets/assembly-transparent.png'
import InvaderSection from './components/InvaderSection.vue'
import PreorderSection from './components/PreorderSection.vue'
import PackagingPreviewSection from './components/PackagingPreviewSection.vue'
import FaqSection from './components/FaqSection.vue'
import GameTargetsSection from './components/GameTargetsSection.vue'
import GameSection from './components/GameSection.vue'
import AppFooter from './components/AppFooter.vue'
import { FEATURES } from './content/features'
import { useIntroTimeline } from './composables/useIntroTimeline'

const heroRef = useTemplateRef('hero')

const { play } = useIntroTimeline(() => heroRef.value?.playIntroSpin())

onMounted(() => play())
</script>

<template>
  <div class="relative min-h-screen overflow-hidden">
    <StarfieldBackground />
    <div class="relative z-10 mx-auto max-w-[1200px] px-8">
      <AppNav />
      <HeroSection ref="hero" />

      <section id="features" class="flex flex-col gap-[64px] px-0 pt-[120px]">
        <SectionHeading label="[ SPEC SHEET ]" heading="Built different" />
        <div class="relative flex items-center justify-end">
          <img
            :src="assemblyTransparent"
            alt="Steel grill assembly overlaid on the controller"
            class="pointer-events-none absolute left-[-32px] w-[690px] max-w-none"
          />
          <div class="flex w-full max-w-[491px] flex-col gap-[38px]">
            <FeatureCard
              v-for="(feature, index) in FEATURES"
              :key="feature.title"
              :feature="feature"
              :index="index"
            />
          </div>
        </div>
      </section>

      <InvaderSection />
      <PreorderSection />
      <GameTargetsSection />
      <PackagingPreviewSection />
      <FaqSection />
      <GameSection />
      <AppFooter />
    </div>
  </div>
</template>
