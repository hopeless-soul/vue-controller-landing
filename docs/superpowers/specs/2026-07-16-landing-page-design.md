# Custom Controller Landing Page — Design

## Context

`specs/Custom Controller Landing Page Draft/` contains a static HTML mockup (`Landing.dc.html`) built with a design tool ("Datachannel") that exports React-ish class-component logic embedded in a `<script type="text/x-dc">` tag, plus inline `style`/`style-hover` attributes that only that tool's runtime understands. It is not directly usable in this Vue 3 + Vite project and needs to be ported to real Vue components.

The draft's starfield background (`starfield.js`) is a placeholder stub (plain upward-drifting dots). A separate sibling project, `..\starfield\`, already has a complete, more sophisticated starfield implementation (3-layer parallax, scroll-velocity-reactive, built on Tailwind v4 + animejs v4) that will be ported in wholesale instead of the stub.

## Goals

- A single-page landing site for a controller shell/skin product ("Customs"), matching the draft's structure: nav, hero with a drag-to-rotate product spinner, a 3-card spec sheet, a pre-order CTA, and a footer.
- Reuse the richer starfield background from the `starfield` sibling project instead of the draft's stub.
- Idiomatic Vue 3 + TypeScript + Tailwind implementation — no leftover Datachannel-specific markup or runtime.

## Non-goals

- No backend, no real checkout/payment flow, no email capture. The pre-order button only performs its bounce animation, per the draft.
- No CMS or multi-page routing — single page only.
- No pixel-exact copy of the draft's placeholder text — copy will be rewritten (see Content below).

## Stack additions

- **Tailwind CSS v4**: `tailwindcss` + `@tailwindcss/vite` as dependencies. Wire `tailwindcss()` into `vite.config.ts`'s `plugins` array. No `tailwind.config.js` needed (v4 default). `src/assets/main.css` gets `@import 'tailwindcss';` plus the page background color, imported once from `main.ts`.
- **animejs v4.5**: named-export API (`animate`, `createTimeline`, `createTimer`, `stagger`) — not the v3 CDN global (`anime.*`) the draft script uses. All ported animation logic is rewritten against v4.
- **`@/` path alias** → `src`, matching the starfield project's `vite.config.ts`, used by the ported starfield modules' internal imports.

## Files ported verbatim from `..\starfield\src\`

Copied as-is (only import paths adjusted if needed):

- `starfield/config.ts`, `starfield/engine.ts`, `starfield/prng.ts`, `starfield/types.ts` — the 3-layer parallax star engine (a near circular-orbit layer, two far oval-orbit layers with opposing scroll multipliers).
- `composables/useScrollVelocity.ts`, `composables/scrollInputs.ts` — wheel/touch-driven scroll velocity used to drive star drift/rotation speed.
- `components/StarfieldBackground.vue` — canvas component: fixed/inset-0/z-0, capped devicePixelRatio, `createTimer`-driven render loop.

## Component tree

```
App.vue
├─ StarfieldBackground.vue   (ported; fixed background, z-0)
├─ AppNav.vue                 (logo + "×" + wordmark, matches draft's centered nav)
├─ HeroSection.vue
│   └─ ProductSpinner.vue     (drag-to-rotate viewer, 16 frames)
├─ FeatureCard.vue            (one spec-sheet card; rendered 3× via v-for)
├─ PreorderSection.vue        (heading, price, CTA button, fine print)
└─ AppFooter.vue              (brand mark + social links)
```

All components use `<script setup lang="ts">` and Tailwind utility classes in the template (no scoped `<style>` blocks, to stay consistent with the ported `StarfieldBackground.vue` and idiomatic for a Tailwind project).

`ProductSpinner.vue` uses the 16 existing frames in `src/assets/controller-render/0001.png`–`0016.png`.

## Composables (new, local to this project)

- **`useIntroTimeline.ts`** — builds an anime v4 `createTimeline()` that plays once on `App.vue` mount: nav fade/slide in → hero headline words stagger in (`stagger()`) → subhead fades in → spinner scales/fades in → (if enabled) one auto-rotation of the spinner (16 frames over ~2.6s). Mirrors the draft's `intro()` method.
- **`useScrollReveal.ts`** — wraps a one-shot `IntersectionObserver` (`threshold: 0.25`, unobserve after firing) that fades/slides an element in when scrolled into view; used on the features heading, each feature card (staggered by index), and the pre-order block. Exposed as a small composable returning a template ref to attach.
- **`useSpinner.ts`** — pointer drag-to-rotate logic for `ProductSpinner`: on `pointerdown` starts tracking, on `pointermove` computes frame delta from horizontal drag distance and mutates the `<img>` `src` directly via a template ref (bypassing Vue reactivity, per the draft's approach, to keep drag smooth), on `pointerup` computes release velocity and applies inertia via `animate()` on a proxy `{ frame }` object with `easeOutQuart`-style easing.

## Content

The draft's placeholder copy ("Customs", "$40", "First run. 500 units.", etc.) will **not** be reused verbatim. New copy will be written for the hero headline/subhead, the three spec-sheet cards (finish / fit / install), the pre-order heading + price + fine print, and the footer brand line — keeping the same slots, structure, and tone (bold, minimal, hype-drop product page) as the draft, but original wording. Exact copy is drafted during implementation and adjustable after review.

## Interaction behavior

- On mount: intro timeline plays (nav → hero words → subhead → spinner → one auto-rotation).
- Spinner: pointer-drag rotates through the 16 frames; releasing applies velocity-based inertia that eases to a stop.
- Scroll reveals: features heading, cards (staggered), and CTA block fade/slide in once when scrolled into view.
- Pre-order button: scale-bounce animation on click; no other side effect (no form, no navigation).

## Testing

Existing `src/__tests__/App.spec.ts` will need updating since it currently asserts against the scaffold's placeholder markup ("You did it!"). New/updated tests should cover:
- Each section renders with expected structure (smoke test per component).
- `useSpinner`'s frame-index math (drag distance → frame delta) is unit-testable in isolation from DOM.
- `ProductSpinner` renders the correct initial frame image.

## Out of scope / open follow-ups

- Real pre-order/checkout integration.
- Final production copy (marketing will likely revise the drafted copy).
- Social link URLs in the footer (left as `#` placeholders, same as the draft).
