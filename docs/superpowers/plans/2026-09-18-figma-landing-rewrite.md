# Figma-Synced Landing Page Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resync every existing landing-page section to the current Figma file (`Controller-Landing (Copy)`, fileKey `Im0gZGkh07hnKPnWqcziVu`) and build the sections that exist in Figma but not yet in code (Invader, Packaging Preview, FAQ, Game Targets, Game/tank), so `src/App.vue` matches the Figma page 1:1 in copy and spacing.

**Architecture:** One Vue 3 `<script setup>` component per Figma section, composed top-to-bottom in `App.vue`. A new shared `SectionHeading.vue` replaces the repeated `[ LABEL ]` + optional big-heading markup. Two new composables (`useInViewport`, `useTankControls`) support the interactive tank section, following the existing composable pattern (plain functions returning refs/handlers, no external state library).

**Tech Stack:** Vue 3 `<script setup>` + TypeScript, Tailwind CSS v4 (utility classes inline, arbitrary values for exact pixel spacing), animejs (already a dependency, used by `useScrollReveal`/`ProductSpinner`), Vitest + `@vue/test-utils` for the one existing suite (`App.spec.ts` — not extended in this plan, per spec non-goals).

## Global Constraints

- Every section's margins, padding, gaps, and widths must match the Figma node's own values (spec: "Cross-cutting requirement: exact spacing") — use Tailwind arbitrary values (`pt-[120px]`, `gap-[64px]`, etc.), not default spacing scale approximations.
- No new Vitest tests for any new or resynced component (spec non-goal). Do not delete or rewrite `src/__tests__/App.spec.ts`; only re-run it to confirm it still passes after each task that touches `App.vue`.
- No hit detection, scoring, or win/lose state for the tank game (spec non-goal).
- Do not modify `StarfieldBackground.vue`, `ProductSpinner.vue`, `useIntroTimeline.ts`, `useScrollVelocity.ts`, or `useSpinner.ts`.
- Hidden Figma nodes (the old `2001:36` Game Targets duplicate, and decorative rectangles `2001:34`/`105:83`/`2001:35`) are not implemented.
- Figma asset export URLs expire after 7 days — this plan uses assets already downloaded into `src/assets/` (see Task 0), not live Figma URLs.
- Every item that already has a `data-reveal`/`data-node-id`-equivalent Tailwind class pattern in the codebase (see `AppNav.vue`, `FeatureCard.vue`) should keep using `useScrollReveal` for consistency, applied to new sections' top-level wrapper.

---

## Task 0: Assets already downloaded (no action needed)

The following files already exist in `src/assets/` (downloaded from Figma during planning, since export URLs expire in 7 days):

- `src/assets/invader-icon.svg` — 128×128 decorative SVG for Invader Section.
- `src/assets/packaging-preview.png` — 693×348 packaging photo for Packaging Preview Section.
- `src/assets/bokiagep-target.png` — 56×56 target sprite for Game Targets Section (same image used for all 5 targets).
- `src/assets/tank.png` — 57×30 tank sprite for Game Section.

No download step is needed in later tasks — just `import` these paths.

---

## Task 1: Fix feature card copy to match Figma

**Files:**

- Modify: `src/content/features.ts`

**Interfaces:**

- Produces: `FEATURES: Feature[]` (unchanged shape, only content values change) — consumed by `FeatureCard.vue` in Task 2 and `App.vue`.

Figma's Card Section (node `4:22`) titles are `Mirror-polished surface`, `Disappears in your hands`, `Just stick it on` — the current code has `Show-floor chrome` and `On in one snap` instead of the first and third. Descriptions and tags already match Figma.

- [ ] **Step 1: Update the two mismatched titles**

Edit `src/content/features.ts`:

```ts
export interface Feature {
  tag: string
  title: string
  description: string
}

export const FEATURES: Feature[] = [
  {
    tag: 'FINISH',
    title: 'Mirror-polished surface',
    description:
      'Vacuum-metallized over a precision-lattice shell. Throws back every light source in the room, and every camera on stream.',
  },
  {
    tag: 'FIT · 27G',
    title: 'Disappears in your hands',
    description:
      'Molded around every button, stick, and trigger. Full range of motion, zero added bulk, 27 grams total.',
  },
  {
    tag: 'INSTALL',
    title: 'Just stick it on',
    description:
      'No tools, no glue, no warranty voided. Clicks on in seconds, pops off just as easily.',
  },
]
```

- [ ] **Step 2: Run the existing suite to confirm nothing broke**

Run: `npm run test:unit`
Expected: PASS (no assertion checks these exact titles, only card count and other section text)

- [ ] **Step 3: Commit**

```bash
git add src/content/features.ts
git commit -m "fix: sync feature card titles with Figma copy"
```

---

## Task 2: Resync `FeatureCard.vue` spacing and remove the index number

**Files:**

- Modify: `src/components/FeatureCard.vue`

**Interfaces:**

- Consumes: `Feature` from `src/content/features.ts` (Task 1), `useScrollReveal` from `src/composables/useScrollReveal.ts` (unchanged signature: `useScrollReveal(delayMs?: number): Ref<HTMLElement | null>`).
- Produces: same `<FeatureCard :feature :index>` public props as before — `App.vue`'s usage in Task 15 is unaffected.

Figma's card (`41:68`/`41:86`/`41:95`) shows only the tag on the left of the top row — no numeric index — and uses `p-[37px]` with `gap-[16px]`. The current component renders a zero-padded index (`01`, `02`, `03`) that doesn't exist in Figma, and uses `p-9` (36px) instead of `37px`.

- [ ] **Step 1: Rewrite the template to drop the index and use exact padding**

Replace the full contents of `src/components/FeatureCard.vue`:

```vue
<script setup lang="ts">
import type { Feature } from '@/content/features'
import { useScrollReveal } from '@/composables/useScrollReveal'

const props = defineProps<{ feature: Feature; index: number }>()

const revealTarget = useScrollReveal(props.index * 110)
</script>

<template>
  <div
    ref="revealTarget"
    data-reveal="card"
    class="flex flex-col gap-[16px] rounded-[20px] border border-white/[0.08] bg-gradient-to-b from-white/[0.055] to-[#17171a] p-[37px] opacity-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_24px_48px_-20px_rgba(0,0,0,0.7)] transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_32px_64px_-20px_rgba(0,0,0,0.85)]"
  >
    <div class="flex items-baseline justify-between">
      <span class="font-mono text-sm tracking-[2px] text-[rgba(242,242,244,0.35)]">{{
        feature.tag
      }}</span>
    </div>
    <div class="text-[32px] font-bold tracking-[-0.3px]">{{ feature.title }}</div>
    <p class="m-0 text-[15px] leading-[1.6] text-[rgba(242,242,244,0.6)]">
      {{ feature.description }}
    </p>
  </div>
</template>
```

The `index` prop is kept (used for the reveal stagger delay) even though it's no longer displayed.

- [ ] **Step 2: Run the existing suite**

Run: `npm run test:unit`
Expected: PASS (`App.spec.ts` only checks card count via `[data-reveal="card"]`, not the number text)

- [ ] **Step 3: Commit**

```bash
git add src/components/FeatureCard.vue
git commit -m "fix: resync FeatureCard spacing and drop index number to match Figma"
```

---

## Task 3: Resync `AppNav.vue` padding

**Files:**

- Modify: `src/components/AppNav.vue`

**Interfaces:**

- Produces: same rendered nav markup consumed by `App.vue` — no prop/emit changes.

Figma's Nav (`4:6`) uses `flex items-center justify-center px-[42px] pt-[32px] pb-[16px]` with `gap-[16px]` on the logo row. Current code uses a CSS grid with `py-8` (32px both top and bottom) and `gap-4` (16px, already correct).

- [ ] **Step 1: Rewrite the template**

Replace the full contents of `src/components/AppNav.vue`:

```vue
<script setup lang="ts">
import logo from '@/assets/logo.png'
</script>

<template>
  <nav
    data-reveal="nav"
    class="flex items-center justify-center px-[42px] pt-[32px] pb-[16px] opacity-0"
  >
    <a href="#top" class="flex items-center gap-[16px]">
      <img :src="logo" alt="hk logo" class="h-6 [image-rendering:pixelated] invert" />
      <span class="translate-y-0.5 font-mono text-[16px] leading-none text-[rgba(242,242,244,0.5)]"
        >✕</span
      >
      <span class="font-hand text-3xl tracking-wide">3d customs</span>
    </a>
  </nav>
</template>
```

- [ ] **Step 2: Run the existing suite**

Run: `npm run test:unit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/AppNav.vue
git commit -m "fix: resync AppNav padding to match Figma"
```

---

## Task 4: Resync `HeroSection.vue` copy and subtext spacing

**Files:**

- Modify: `src/components/HeroSection.vue`

**Interfaces:**

- Produces: same `playIntroSpin()` exposed method — `App.vue`'s `heroRef.value?.playIntroSpin()` call is unaffected.

Figma's Subtle Hero Text (`4:17`) copy reads "goes over your controller" — current code says "snaps over your controller". Figma's padding on that text block is `pt-[23px] pb-[1px]` (rounded from `23.13px`/`0.645px`); current is `mt-6`.

- [ ] **Step 1: Update copy and spacing**

Edit `src/components/HeroSection.vue`, replacing the subtext `<p>`:

```vue
<p
  data-reveal="sub"
  class="m-0 max-w-[520px] pt-[23px] pb-[1px] text-lg leading-[1.55] text-[rgba(242,242,244,0.62)] opacity-0"
>
  A hand-finished steel grill that goes over your controller in seconds — mirror-polished,
  feather-light, zero compromise.
</p>
```

(Only the `class` attribute and the sentence text change; everything else in the file — the `<h1>`, `<ProductSpinner>`, script block — stays as-is.)

- [ ] **Step 2: Run the existing suite**

Run: `npm run test:unit`
Expected: PASS (`App.spec.ts` checks for `'Your controller.'` text, unaffected)

- [ ] **Step 3: Commit**

```bash
git add src/components/HeroSection.vue
git commit -m "fix: resync hero subtext copy and spacing to match Figma"
```

---

## Task 5: Create shared `SectionHeading.vue`

**Files:**

- Create: `src/components/SectionHeading.vue`

**Interfaces:**

- Produces: `SectionHeading` component with props `{ label: string; heading?: string }`. `label` renders the small mono `[ LABEL ]` line; `heading`, if provided, renders the large bold line below it. Consumed by `App.vue` (Task 15) and `PreorderSection.vue` (Task 6).

Figma's "Section Heading Container" instance (`105:27`/`105:50`/`105:58`) is `flex flex-col gap-[14px] items-center` (the label itself is centered via its own `items-center` wrapper), label text is `font-mono text-xl uppercase tracking-[4px] text-[rgba(242,242,244,0.4)]`, and the optional heading is `text-[44px] font-bold tracking-[-1px] leading-[66px]` in `#f2f2f4`.

- [ ] **Step 1: Create the component**

```vue
<script setup lang="ts">
defineProps<{ label: string; heading?: string }>()
</script>

<template>
  <div class="flex w-full flex-col items-center gap-[14px] text-center">
    <div class="font-mono text-xl uppercase tracking-[4px] text-[rgba(242,242,244,0.4)]">
      {{ label }}
    </div>
    <h2
      v-if="heading"
      class="m-0 text-[44px] font-bold leading-[66px] tracking-[-1px] text-[#f2f2f4]"
    >
      {{ heading }}
    </h2>
  </div>
</template>
```

- [ ] **Step 2: Run the existing suite**

Run: `npm run test:unit`
Expected: PASS (new unused-so-far file doesn't affect existing tests)

- [ ] **Step 3: Commit**

```bash
git add src/components/SectionHeading.vue
git commit -m "feat: add shared SectionHeading component"
```

---

## Task 6: Resync `PreorderSection.vue`

**Files:**

- Modify: `src/components/PreorderSection.vue`

**Interfaces:**

- Consumes: `SectionHeading` from Task 5 (`{ label }`, no `heading` prop passed).
- Produces: same section markup — no props/emits, so nothing downstream changes.

Figma's Preorder Section (`45:27`) differs from current code in:

- Section gap is `gap-[12.7px]` between the heading/headline/subtext/button/footer blocks (flex-col), with `pt-[120px]` on the section itself (current: `pb-40 pt-48`, no explicit gap).
- The `[ FIRST DROP ]` label uses the new shared heading component instead of inline markup.
- The headline "300 units. One shot." block has `pt-[65px] pb-[13px]` (current: none, relies on `mb-3.5` above).
- Button padding is `px-[49px] py-[19px]` (current: `px-12 py-[19px]` ≈ 48px, close — round to `px-[49px]` for exactness).
- "REFUNDABLE ANYTIME BEFORE SHIPPING" is wrapped in dashes and rendered in a warm gold color (`rgba(247,209,56,0.9)`), not gray, with `pt-[31px]` above it (current: plain gray, `mt-3.5`, no dashes).

- [ ] **Step 1: Rewrite the template**

Replace the full contents of `src/components/PreorderSection.vue`:

```vue
<script setup lang="ts">
import { animate } from 'animejs'
import { useScrollReveal } from '@/composables/useScrollReveal'
import SectionHeading from './SectionHeading.vue'

const revealTarget = useScrollReveal()

function onPreorder(event: MouseEvent) {
  const button = event.currentTarget as HTMLElement
  animate(button, {
    scale: [
      { to: 0.92, duration: 90 },
      { to: 1, duration: 350, ease: 'outElastic' },
    ],
  })
}
</script>

<template>
  <section id="preorder" class="px-0 pt-[120px] pb-40 text-center">
    <div ref="revealTarget" class="flex flex-col items-center gap-[12.7px] opacity-0">
      <SectionHeading label="[ FIRST DROP ]" />
      <div
        class="pt-[65px] pb-[13px] text-[clamp(30px,5vw,52px)] font-bold leading-[1.1] tracking-[-1.5px]"
      >
        300 units. One shot.
      </div>
      <p class="mx-auto max-w-[420px] text-[17px] leading-[1.55] text-[rgba(242,242,244,0.6)]">
        Hand-finished in small batches and gone fast. Reserve now, ships worldwide this fall.
      </p>
      <button
        type="button"
        class="cursor-pointer rounded-full border border-white/90 bg-gradient-to-b from-white via-[#d8d8de] to-[#f0f0f4] px-[49px] py-[19px] text-[17px] font-semibold tracking-[0.2px] text-[#0c0c0e] shadow-[inset_0_1px_0_#fff,0_10px_30px_-8px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.03]"
        @click="onPreorder"
      >
        Reserve — $38
      </button>
      <div class="pt-[31px] font-mono text-[17px] tracking-[0.4px] text-[rgba(247,209,56,0.9)]">
        - REFUNDABLE ANYTIME BEFORE SHIPPING -
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 2: Run the existing suite**

Run: `npm run test:unit`
Expected: PASS (`App.spec.ts` checks `'300 units. One shot.'` text, unaffected)

- [ ] **Step 3: Commit**

```bash
git add src/components/PreorderSection.vue
git commit -m "fix: resync PreorderSection spacing and copy to match Figma"
```

---

## Task 7: Create `InvaderSection.vue`

**Files:**

- Create: `src/components/InvaderSection.vue`

**Interfaces:**

- Produces: `InvaderSection` component, no props. Consumed by `App.vue` (Task 15).

Figma's Invader Section (`105:81`) is `flex items-start justify-center` containing one `128×128` icon, no other spacing.

- [ ] **Step 1: Create the component**

```vue
<script setup lang="ts">
import invaderIcon from '@/assets/invader-icon.svg'
</script>

<template>
  <section class="flex items-start justify-center">
    <img :src="invaderIcon" alt="" class="h-[128px] w-[128px]" aria-hidden="true" />
  </section>
</template>
```

- [ ] **Step 2: Run the existing suite**

Run: `npm run test:unit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/InvaderSection.vue
git commit -m "feat: add InvaderSection component"
```

---

## Task 8: Create `PackagingPreviewSection.vue`

**Files:**

- Create: `src/components/PackagingPreviewSection.vue`

**Interfaces:**

- Consumes: `SectionHeading` from Task 5.
- Produces: `PackagingPreviewSection` component, no props. Consumed by `App.vue` (Task 15).

Figma's Packaging Preview Section (`57:26`) is `flex flex-col items-center gap-[10px] pt-[120px]`, with the image at `693×348` and a centered subtle text block below (`max-w-[420px]`, `pt-[4px] pb-[22px]`, two-line copy).

- [ ] **Step 1: Create the component**

```vue
<script setup lang="ts">
import packagingPreview from '@/assets/packaging-preview.png'
import SectionHeading from './SectionHeading.vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

const revealTarget = useScrollReveal()
</script>

<template>
  <section class="flex flex-col items-center gap-[10px] pt-[120px]">
    <SectionHeading label="[ PACKAGING ]" />
    <div ref="revealTarget" class="flex flex-col items-center opacity-0">
      <img
        :src="packagingPreview"
        alt="3d Customs packaging"
        width="693"
        height="348"
        class="w-full max-w-[693px]"
      />
      <p
        class="max-w-[420px] pt-[4px] pb-[22px] text-center text-[17px] leading-[1.55] text-[rgba(242,242,244,0.6)]"
      >
        Hand-finished, laser-precision engineered packaging that transforms unboxing into ritual.
      </p>
    </div>
  </section>
</template>
```

- [ ] **Step 2: Run the existing suite**

Run: `npm run test:unit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/PackagingPreviewSection.vue
git commit -m "feat: add PackagingPreviewSection component"
```

---

## Task 9: Create `FaqItem.vue` and `FaqSection.vue`

**Files:**

- Create: `src/components/FaqItem.vue`
- Create: `src/components/FaqSection.vue`

**Interfaces:**

- `FaqItem` produces props `{ question: string; body?: string }`, no emits — manages its own open/closed state internally.
- `FaqSection` consumes `FaqItem` and a local FAQ data array; produces `FaqSection` component with no props, consumed by `App.vue` (Task 15).

Figma's FAQ Section (`2029:222`) has a `32px` bold "FAQ" header, then 4 items in a `flex-col gap-[16px]` list, each with a bottom border. The first two items have a question + a lorem-ipsum body (visible in Figma as always-expanded in the mock, but per spec each item's open/closed state is independent, defaulting closed, so the accordion behavior is real toggling); the last two are header-only rows with just a chevron (no body content at all — clicking them has nothing to expand).

- [ ] **Step 1: Create `FaqItem.vue`**

```vue
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
    <p
      v-if="body && isOpen"
      class="m-0 max-w-[1042px] pb-[8px] text-[15px] leading-[1.6] text-[rgba(242,242,244,0.33)]"
    >
      {{ body }}
    </p>
  </div>
</template>
```

- [ ] **Step 2: Create `FaqSection.vue`**

```vue
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
    question: 'What is it made of',
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
  <section class="flex flex-col items-start gap-[20px]">
    <h2 class="m-0 text-[32px] font-bold leading-[28px] tracking-[-0.3px] text-[#f2f2f4]">FAQ</h2>
    <div class="flex w-full flex-col gap-[16px]">
      <FaqItem v-for="faq in FAQS" :key="faq.question" :question="faq.question" :body="faq.body" />
    </div>
  </section>
</template>
```

- [ ] **Step 3: Run the existing suite**

Run: `npm run test:unit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/FaqItem.vue src/components/FaqSection.vue
git commit -m "feat: add FaqSection and FaqItem components"
```

---

## Task 10: Create `GameTargetsSection.vue`

**Files:**

- Create: `src/components/GameTargetsSection.vue`

**Interfaces:**

- Produces: `GameTargetsSection` component, no props. Exposes no template ref (purely decorative, no game logic lives here per spec). Consumed by `App.vue` (Task 15), placed directly above `GameSection`.

Figma's Game Targets Section (`57:37`) is `flex items-start justify-center gap-[98px] pt-[120px]`, 5 identical `56×56` sprites.

- [ ] **Step 1: Create the component**

```vue
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
```

- [ ] **Step 2: Run the existing suite**

Run: `npm run test:unit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/GameTargetsSection.vue
git commit -m "feat: add GameTargetsSection component"
```

---

## Task 11: Create `useInViewport` composable

**Files:**

- Create: `src/composables/useInViewport.ts`

**Interfaces:**

- Produces: `useInViewport(): { target: Ref<HTMLElement | null>; isInViewport: Ref<boolean> }`. Consumed by `GameSection.vue` (Task 13) to gate firing.

Mirrors `useScrollReveal.ts`'s IntersectionObserver setup, but tracks ongoing visibility (both enter and exit) instead of firing once.

- [ ] **Step 1: Create the composable**

```ts
import { onMounted, onUnmounted, ref, type Ref } from 'vue'

/**
 * Tracks whether the returned target element currently intersects the
 * viewport. Unlike useScrollReveal, this keeps updating on both enter and
 * exit — used to gate interactions (e.g. only allow firing) to when a
 * section is actually visible.
 */
export function useInViewport(): { target: Ref<HTMLElement | null>; isInViewport: Ref<boolean> } {
  const target = ref<HTMLElement | null>(null)
  const isInViewport = ref(false)

  onMounted(() => {
    const el = target.value
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      isInViewport.value = true
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isInViewport.value = entry.isIntersecting
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(el)

    onUnmounted(() => observer.disconnect())
  })

  return { target, isInViewport }
}
```

- [ ] **Step 2: Run the existing suite**

Run: `npm run test:unit`
Expected: PASS (new unused-so-far file)

- [ ] **Step 3: Commit**

```bash
git add src/composables/useInViewport.ts
git commit -m "feat: add useInViewport composable"
```

---

## Task 12: Create `useTankControls` composable

**Files:**

- Create: `src/composables/useTankControls.ts`

**Interfaces:**

- Produces: `useTankControls(options: { tankWidth: number; canFire: () => boolean }): { trackRef: Ref<HTMLElement | null>; tankX: Ref<number>; projectiles: Ref<Projectile[]>; onPointerMove: (e: PointerEvent) => void; onPointerDown: (e: PointerEvent) => void }` where `Projectile = { id: number; x: number }`. Consumed by `GameSection.vue` (Task 13).
- `canFire()` is called on every fire attempt; when it returns `false` (section not in viewport, wired to `useInViewport` in Task 13), the pointerdown is a no-op.

Behavior: `tankX` follows pointer x within the track, clamped to `[0, trackWidth - tankWidth]`. `onPointerDown` (covers both mouse LMB — `button === 0` — and touch, since touch synthesizes pointerdown with `button === 0`) spawns a projectile at the current `tankX + tankWidth / 2`. Projectiles are removed by the consuming component once they leave the visible area (the composable just appends; removal timing is the component's job since it owns the animation/visual bounds).

- [ ] **Step 1: Create the composable**

```ts
import { ref, type Ref } from 'vue'

export interface Projectile {
  id: number
  x: number
}

interface UseTankControlsOptions {
  tankWidth: number
  canFire: () => boolean
}

let nextProjectileId = 0

export function useTankControls(options: UseTankControlsOptions): {
  trackRef: Ref<HTMLElement | null>
  tankX: Ref<number>
  projectiles: Ref<Projectile[]>
  onPointerMove: (event: PointerEvent) => void
  onPointerDown: (event: PointerEvent) => void
  removeProjectile: (id: number) => void
} {
  const trackRef = ref<HTMLElement | null>(null)
  const tankX = ref(0)
  const projectiles = ref<Projectile[]>([])

  function clampToTrack(x: number): number {
    const track = trackRef.value
    if (!track) return x
    const maxX = Math.max(0, track.clientWidth - options.tankWidth)
    return Math.min(Math.max(x, 0), maxX)
  }

  function onPointerMove(event: PointerEvent) {
    const track = trackRef.value
    if (!track) return
    const rect = track.getBoundingClientRect()
    const relativeX = event.clientX - rect.left - options.tankWidth / 2
    tankX.value = clampToTrack(relativeX)
  }

  function onPointerDown(event: PointerEvent) {
    if (event.button !== 0) return
    if (!options.canFire()) return
    projectiles.value.push({ id: nextProjectileId++, x: tankX.value + options.tankWidth / 2 })
  }

  function removeProjectile(id: number) {
    projectiles.value = projectiles.value.filter((p) => p.id !== id)
  }

  return { trackRef, tankX, projectiles, onPointerMove, onPointerDown, removeProjectile }
}
```

- [ ] **Step 2: Run the existing suite**

Run: `npm run test:unit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/composables/useTankControls.ts
git commit -m "feat: add useTankControls composable"
```

---

## Task 13: Create `GameSection.vue`

**Files:**

- Create: `src/components/GameSection.vue`

**Interfaces:**

- Consumes: `useTankControls` (Task 12), `useInViewport` (Task 11), `tank.png` asset.
- Produces: `GameSection` component, no props. Consumed by `App.vue` (Task 15), placed directly below `GameTargetsSection`.

Figma's Game Section (`22:6`) centers a `494px`-wide track containing the `57×30` tank, `flex items-center justify-center`, track itself `flex flex-col items-end justify-center py-[10px]` (tank hugs the right edge in the static mock — irrelevant once it's driven by pointer position). Projectiles animate from the tank upward and are removed via a `transitionend` listener once they've traveled out of view, so the array doesn't grow unbounded.

- [ ] **Step 1: Create the component**

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import tankSprite from '@/assets/tank.png'
import { useTankControls } from '@/composables/useTankControls'
import { useInViewport } from '@/composables/useInViewport'

const TANK_WIDTH = 57
const PROJECTILE_TRAVEL_MS = 900

const { target: viewportTarget, isInViewport } = useInViewport()
const { trackRef, tankX, projectiles, onPointerMove, onPointerDown, removeProjectile } =
  useTankControls({
    tankWidth: TANK_WIDTH,
    canFire: () => isInViewport.value,
  })

function handleFire(event: PointerEvent) {
  const before = projectiles.value.length
  onPointerDown(event)
  if (projectiles.value.length > before) {
    const spawned = projectiles.value[projectiles.value.length - 1]!
    window.setTimeout(() => removeProjectile(spawned.id), PROJECTILE_TRAVEL_MS)
  }
}

let removeTouchListener: (() => void) | undefined

onMounted(() => {
  const track = trackRef.value
  if (!track) return
  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0]
    if (!touch) return
    handleFire({ button: 0, clientX: touch.clientX } as PointerEvent)
  }
  track.addEventListener('touchstart', onTouchStart, { passive: true })
  removeTouchListener = () => track.removeEventListener('touchstart', onTouchStart)
})

onUnmounted(() => removeTouchListener?.())
</script>

<template>
  <section
    :ref="(el) => (viewportTarget.value = el as HTMLElement | null)"
    class="flex items-center justify-center overflow-hidden"
  >
    <div
      ref="trackRef"
      class="relative flex h-[50px] w-full max-w-[494px] items-center py-[10px]"
      @pointermove="onPointerMove"
      @pointerdown="handleFire"
    >
      <div
        v-for="projectile in projectiles"
        :key="projectile.id"
        class="pointer-events-none absolute bottom-full h-[10px] w-[3px] -translate-x-1/2 rounded-full bg-white transition-transform ease-linear"
        :style="{
          left: `${projectile.x}px`,
          transitionDuration: `${PROJECTILE_TRAVEL_MS}ms`,
          transform: 'translate(-50%, -400px)',
        }"
      />
      <img
        :src="tankSprite"
        alt=""
        aria-hidden="true"
        class="absolute h-[30px] w-[57px]"
        :style="{ left: `${tankX}px` }"
      />
    </div>
  </section>
</template>
```

Notes for the implementer: the projectile's upward travel distance (`-400px`) is a fixed visual flourish, not tied to target positions (no hit detection per spec). `viewportTarget.value` is assigned via a function-ref binding because the section root also needs `trackRef`-independent visibility tracking — `useInViewport`'s `target` must point at the outer `<section>` so visibility reflects the whole game area, not just the track.

- [ ] **Step 2: Run the existing suite**

Run: `npm run test:unit`
Expected: PASS

- [ ] **Step 3: Manually verify in the browser**

Run: `npm run dev`, open the page, scroll to the Game Section, move the mouse over the track (tank follows cursor, clamped to track edges), left-click to fire (a projectile streaks upward and disappears), scroll the section out of view and confirm clicking no longer spawns projectiles.

- [ ] **Step 4: Commit**

```bash
git add src/components/GameSection.vue
git commit -m "feat: add interactive GameSection with tank movement and firing"
```

---

## Task 14: Resync `AppFooter.vue`

**Files:**

- Modify: `src/components/AppFooter.vue`

**Interfaces:**

- Produces: same footer markup, no props/emits.

Figma's Footer (`4:68`) uses a `0.909px` top border (round to `1px`, Tailwind has no sub-pixel border utility) with `pt-[17px] pb-[16px]` (current: `pb-11 pt-9` = 44px/36px, too large).

- [ ] **Step 1: Update padding**

Edit `src/components/AppFooter.vue`, changing the `<footer>` class:

```vue
<footer
  class="flex flex-wrap items-center justify-between gap-5 border-t border-white/[0.08] px-0 pt-[17px] pb-[16px]"
>
```

(Only the class attribute changes; the rest of the file stays as-is.)

- [ ] **Step 2: Run the existing suite**

Run: `npm run test:unit`
Expected: PASS (`App.spec.ts` checks `'© 2026'` text, unaffected)

- [ ] **Step 3: Commit**

```bash
git add src/components/AppFooter.vue
git commit -m "fix: resync AppFooter padding to match Figma"
```

---

## Task 15: Compose the full page in `App.vue`

**Files:**

- Modify: `src/App.vue`

**Interfaces:**

- Consumes every component from Tasks 2–14: `FeatureCard`, `SectionHeading`, `PreorderSection`, `InvaderSection`, `PackagingPreviewSection`, `FaqSection`, `GameTargetsSection`, `GameSection`, `AppFooter`, `AppNav`, `HeroSection`.

Final section order per the spec's inventory table: Nav → Hero → Card Section (heading + cards) → Invader → Preorder → Packaging Preview → FAQ → Game Targets → Game → Footer.

- [ ] **Step 1: Rewrite `App.vue`**

```vue
<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'
import StarfieldBackground from './components/StarfieldBackground.vue'
import AppNav from './components/AppNav.vue'
import HeroSection from './components/HeroSection.vue'
import SectionHeading from './components/SectionHeading.vue'
import FeatureCard from './components/FeatureCard.vue'
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

      <section id="features" class="flex flex-col gap-[64px] px-0 pt-[120px] pb-16">
        <SectionHeading label="[ SPEC SHEET ]" heading="Built different" />
        <div class="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
          <FeatureCard
            v-for="(feature, index) in FEATURES"
            :key="feature.title"
            :feature="feature"
            :index="index"
          />
        </div>
      </section>

      <InvaderSection />
      <PreorderSection />
      <PackagingPreviewSection />
      <FaqSection />
      <GameTargetsSection />
      <GameSection />
      <AppFooter />
    </div>
  </div>
</template>
```

- [ ] **Step 2: Run the existing suite**

Run: `npm run test:unit`
Expected: PASS (`App.spec.ts` still finds `'Customs'`, `'Your controller.'`, `'Built different'`, `'300 units. One shot.'`, `'© 2026'`, and exactly 3 `[data-reveal="card"]` elements)

- [ ] **Step 3: Manually verify in the browser**

Run: `npm run dev`, scroll through the full page top to bottom, and confirm every section renders in order: Nav, Hero, Spec Sheet cards, Invader icon, Preorder, Packaging Preview, FAQ, Game Targets, Game (tank), Footer.

- [ ] **Step 4: Commit**

```bash
git add src/App.vue
git commit -m "feat: compose full Figma-synced landing page in App.vue"
```

---

## Plan Self-Review Notes

- **Spec coverage:** every row of the spec's section inventory table maps to a task (Nav→3, Hero→4, Card Section→1/2/5, Invader→7, Preorder→6, Packaging→8, FAQ→9, Game Targets→10, Game→11/12/13, Footer→14, composition→15). The cross-cutting exact-spacing requirement is addressed per-task via Figma-sourced arbitrary Tailwind values. The `SectionHeading` shared component (Task 5) matches the spec's explicit ask. Non-goals (no tests, no hit detection, no changes to `StarfieldBackground`/`ProductSpinner`/existing composables) are upheld throughout.
- **Type consistency:** `Projectile { id, x }` from Task 12 is used identically in Task 13's template (`projectile.id`, `projectile.x`). `useInViewport()`'s `{ target, isInViewport }` return shape matches its Task 13 usage (`target: viewportTarget, isInViewport`). `useTankControls` options `{ tankWidth, canFire }` match Task 13's call site.
- **Placeholder scan:** no TBD/TODO markers; every step has complete, runnable code.
