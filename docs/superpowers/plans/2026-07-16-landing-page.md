# Custom Controller Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page Vue 3 + TypeScript + Tailwind landing page for a controller chrome-shell product, replacing the current scaffold with a real hero/spinner/features/pre-order/footer page, and reusing the richer starfield background from the sibling `starfield` project.

**Architecture:** A tree of small `<script setup lang="ts">` components (`AppNav`, `HeroSection`, `ProductSpinner`, `FeatureCard`, `PreorderSection`, `AppFooter`, `StarfieldBackground`) composed in `App.vue`. Three composables carry the interactive logic: `useSpinner` (drag-to-rotate the 16-frame product image), `useScrollReveal` (one-shot fade/slide-in on scroll via `IntersectionObserver`), and `useIntroTimeline` (the mount-time entrance sequence). The starfield's engine/composable files are ported verbatim from `..\starfield\src\`.

**Tech Stack:** Vue 3 (`<script setup>`, Composition API), TypeScript, Vite, Tailwind CSS v4 (`@tailwindcss/vite`), animejs v4 (`animate`, `createTimeline`, `createAnimatable`, `utils`), Vitest + `@vue/test-utils`.

## Global Constraints

- Tailwind CSS v4 via `@tailwindcss/vite` — no `tailwind.config.js`; theme tokens go in `src/assets/main.css` via `@theme`.
- animejs `^4.5.0`, imported via named exports (`animate`, `createTimeline`, `createAnimatable`, `utils`) — never the v3 global `anime.*` API.
- All new/edited components use Tailwind utility classes in the template; no `scoped` `<style>` blocks (except where a plain CSS custom property/font-face is unavoidable, which goes in `main.css`).
- `ProductSpinner` mutates the `<img>` `src` directly via a template ref during drag (bypassing Vue reactivity) — never store the live drag frame in a reactive `ref<number>`.
- Copy is original (not the draft's placeholder text). Brand name: **Customs**. Price: **$38**. Run size: **300 units**. Shell weight: **27g**.
- No backend/checkout integration; the pre-order button only plays a bounce animation.
- The 16 spinner frames already exist at `src/assets/controller-render/0001.png`–`0016.png` — do not recreate or rename them.

---

## Task 1: Install dependencies, configure Tailwind + animejs, update HTML shell

**Files:**

- Modify: `package.json`
- Modify: `vite.config.ts`
- Create: `src/assets/main.css`
- Modify: `src/main.ts`
- Modify: `index.html`

**Interfaces:**

- Produces: a working Tailwind v4 pipeline (`@import 'tailwindcss'` resolves, `@theme` font tokens `--font-hand`, `--font-mono` available as `font-hand`/`font-mono` utilities) and `animejs` available for import in later tasks.

- [ ] **Step 1: Install dependencies**

Run:

```bash
npm install animejs@^4.5.0 tailwindcss@^4.3.2 @tailwindcss/vite@^4.3.2
```

Expected: `package.json` `dependencies` gains `animejs`, `tailwindcss`, `@tailwindcss/vite`.

- [ ] **Step 2: Wire the Tailwind Vite plugin**

Edit `vite.config.ts` to:

```ts
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

- [ ] **Step 3: Create the global stylesheet**

Create `src/assets/main.css`:

```css
@import 'tailwindcss';

@theme {
  --font-hand: 'Permanent Marker', cursive;
  --font-mono: 'VT323', monospace;
}

body {
  margin: 0;
  background-color: #121214;
  color: #f2f2f4;
  font-family: 'Space Grotesk', sans-serif;
  -webkit-font-smoothing: antialiased;
}

::selection {
  background: rgba(255, 255, 255, 0.2);
}
```

- [ ] **Step 4: Import the stylesheet from `main.ts`**

Edit `src/main.ts`:

```ts
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

- [ ] **Step 5: Add fonts and page title to `index.html`**

Edit `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Space+Grotesk:wght@400;500;600;700&family=VT323&display=swap"
      rel="stylesheet"
    />
    <title>Customs — Chrome Controller Shells</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 6: Verify the build pipeline**

Run: `npm run build`
Expected: build succeeds with no errors (the existing scaffold `App.vue` still compiles; Tailwind/animejs are installed but not yet used in components).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vite.config.ts src/assets/main.css src/main.ts index.html
git commit -m "chore: add Tailwind v4 and animejs v4, wire global stylesheet and fonts"
```

---

## Task 2: Port the starfield star-field engine (config, engine, prng, types)

**Files:**

- Create: `src/starfield/types.ts`
- Create: `src/starfield/prng.ts`
- Create: `src/starfield/config.ts`
- Create: `src/starfield/engine.ts`
- Test: `src/starfield/__tests__/prng.spec.ts`
- Test: `src/starfield/__tests__/engine.spec.ts`

**Interfaces:**

- Produces: `Star`, `LayerConfig`, `SeedSet` types; `mulberry32(seed): Rng`, `randRange(rng, min, max): number`; `SEEDS`, `LAYERS`, `SCROLL_TO_ANGULAR`, `SCROLL_TO_DRIFT`, `MAX_FRAME_TIME`, `SPEED_SLEW`, `MAX_DPR` constants; `createStars(layer, seeds, layerIndex): Star[]`, `approach(current, target, maxDelta): number`, `updateStars(stars, layer, scrollSpeed, dt): void`, `projectStar(star, layer, scrollSpeed, cx, cy, maxRadius): {x, y}`, `drawStars(ctx, stars, layer, scrollSpeed, width, height): void` — all consumed by `StarfieldBackground.vue` in Task 4.

- [ ] **Step 1: Create `src/starfield/types.ts`**

```ts
export interface Star {
  /** Orbit angle around the canvas center, in radians. */
  angle: number
  /** Orbit radius as a fraction of the canvas half-diagonal, in (0, 1]. */
  radius: number
  /** Base angular speed, in radians per second. */
  speed: number
  /** Draw radius in CSS pixels. */
  size: number
}

export interface LayerConfig {
  count: number
  sizeMin: number
  sizeMax: number
  speedMin: number
  speedMax: number
  /** Vertical stretch of the orbit: 1 = circle, >1 = oval. */
  yScale: number
  /** Multiplier applied to each star's base angular speed. */
  /** Note: A negative value reverses the direction. */
  speedMult: number
  /** Multiplier applied to the scroll contribution to rotation speed. */
  scrollMult: number
  /** Multiplier applied to the vertical up/down drift on scroll. */
  driftMult: number
  color: string
}

export interface SeedSet {
  position: number
  size: number
  speed: number
}
```

- [ ] **Step 2: Create `src/starfield/prng.ts`**

```ts
export type Rng = () => number

/**
 * Mulberry32 — small deterministic PRNG. Same seed always yields the same
 * sequence of floats in [0, 1).
 */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randRange(rng: Rng, min: number, max: number): number {
  return min + rng() * (max - min)
}
```

- [ ] **Step 3: Write the failing prng test**

Create `src/starfield/__tests__/prng.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { mulberry32, randRange } from '../prng'

describe('mulberry32', () => {
  it('is deterministic for the same seed', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    const seqA = Array.from({ length: 10 }, () => a())
    const seqB = Array.from({ length: 10 }, () => b())
    expect(seqA).toEqual(seqB)
  })

  it('produces different sequences for different seeds', () => {
    const a = mulberry32(1)
    const b = mulberry32(2)
    const seqA = Array.from({ length: 10 }, () => a())
    const seqB = Array.from({ length: 10 }, () => b())
    expect(seqA).not.toEqual(seqB)
  })

  it('yields floats in [0, 1)', () => {
    const rng = mulberry32(123)
    for (let i = 0; i < 1000; i++) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('randRange', () => {
  it('stays within [min, max)', () => {
    const rng = mulberry32(7)
    for (let i = 0; i < 1000; i++) {
      const v = randRange(rng, -5, 12)
      expect(v).toBeGreaterThanOrEqual(-5)
      expect(v).toBeLessThan(12)
    }
  })
})
```

- [ ] **Step 4: Run the prng test**

Run: `npx vitest run src/starfield/__tests__/prng.spec.ts`
Expected: PASS (the implementation was written in Step 2 alongside the test; this confirms it).

- [ ] **Step 5: Create `src/starfield/config.ts`**

```ts
import type { LayerConfig, SeedSet } from './types'

// Size and speed are drawn from independent PRNG streams with their own
// global seeds, so tweaking one distribution never reshuffles the other.
export const SEEDS: SeedSet = {
  position: 1337,
  size: 20260715,
  speed: 987654323,
}

/** Converts smoothed scroll speed into extra angular speed (rad/s per unit). */
export const SCROLL_TO_ANGULAR = 0.0006
/** Converts smoothed scroll speed into vertical drift (px per unit). */
export const SCROLL_TO_DRIFT = 0.36
/** Cap on per-frame delta time (s) so dropped frames can't jump star angles. */
export const MAX_FRAME_TIME = 0.1
/** Max change per second of the speed value used for rendering (units/s). */
export const SPEED_SLEW = 9000
/**
 * Cap on devicePixelRatio for the canvas backing store. Phones report DPR 3,
 * which is ~9x the pixels of DPR 1 to fill every frame; for ~1px stars the
 * difference past 2 is invisible but the fill cost is not.
 */
export const MAX_DPR = 2

/** Layer 1 — close stars: circular orbits, larger and brighter. */
export const CLOSE_LAYER: LayerConfig = {
  count: 90,
  sizeMin: 0.8,
  sizeMax: 1.0,
  speedMin: 0.02,
  speedMax: 0.03,
  yScale: 1,
  speedMult: -1,
  scrollMult: -1.2,
  driftMult: 0.5,
  color: 'rgba(255, 255, 255, 0.9)',
}

/** Layer 2 — far stars: oval orbits (y × 1.5), faster multipliers, dimmer. */
export const FAR_LAYER: LayerConfig = {
  count: 180,
  sizeMin: 0.5,
  sizeMax: 0.8,
  speedMin: 0.02,
  speedMax: 0.06,
  yScale: 1.5,
  speedMult: -1,
  scrollMult: -1.8,
  driftMult: 0.6,
  color: 'rgba(255, 255, 255, 0.45)',
}

/** Layer 3 — far stars: oval orbits (y × 1.5), faster multipliers, dimmer. */
export const REVERSE_FAR_LAYER: LayerConfig = {
  count: 90,
  sizeMin: 0.2,
  sizeMax: 0.5,
  speedMin: 0.02,
  speedMax: 0.06,
  yScale: 1.5,
  speedMult: -1,
  scrollMult: 1.8,
  driftMult: 0.6,
  color: 'rgba(255, 255, 255, 0.45)',
}

/** Draw order: far layer first so close stars render on top. */
export const LAYERS: LayerConfig[] = [FAR_LAYER, CLOSE_LAYER, REVERSE_FAR_LAYER]
```

- [ ] **Step 6: Create `src/starfield/engine.ts`**

```ts
import { SCROLL_TO_ANGULAR, SCROLL_TO_DRIFT } from './config'
import { mulberry32, randRange } from './prng'
import type { LayerConfig, SeedSet, Star } from './types'

const TWO_PI = Math.PI * 2
const MIN_RADIUS = 0.05

/**
 * Builds a layer's stars from three independent seeded streams. The layer
 * index offsets each seed so layers get distinct but reproducible fields.
 */
export function createStars(layer: LayerConfig, seeds: SeedSet, layerIndex: number): Star[] {
  const positionRng = mulberry32(seeds.position + layerIndex)
  const sizeRng = mulberry32(seeds.size + layerIndex)
  const speedRng = mulberry32(seeds.speed + layerIndex)
  return Array.from({ length: layer.count }, () => ({
    angle: randRange(positionRng, 0, TWO_PI),
    radius: randRange(positionRng, MIN_RADIUS, 1),
    size: randRange(sizeRng, layer.sizeMin, layer.sizeMax),
    speed: randRange(speedRng, layer.speedMin, layer.speedMax),
  }))
}

/**
 * Moves current toward target by at most maxDelta. Used to slew-limit the
 * rendered scroll speed: after a frame stall the smoothed value may have
 * jumped far ahead, and the drift offset is a direct function of it, so an
 * unbounded step would teleport every star vertically.
 */
export function approach(current: number, target: number, maxDelta: number): number {
  if (maxDelta <= 0) return current
  return current + Math.min(Math.max(target - current, -maxDelta), maxDelta)
}

/** Advances orbit angles: base speed plus scroll contribution, scaled by dt (s). */
export function updateStars(
  stars: Star[],
  layer: LayerConfig,
  scrollSpeed: number,
  dt: number,
): void {
  const scrollAngular = scrollSpeed * layer.scrollMult * SCROLL_TO_ANGULAR
  for (const star of stars) {
    star.angle += (star.speed * layer.speedMult + scrollAngular) * dt
  }
}

/**
 * Projects a star's polar state to canvas coordinates: circular/oval orbit
 * around the center plus the additional (0, scroll drift) vector.
 */
export function projectStar(
  star: Star,
  layer: LayerConfig,
  scrollSpeed: number,
  cx: number,
  cy: number,
  maxRadius: number,
): { x: number; y: number } {
  const r = star.radius * maxRadius
  return {
    x: cx + Math.cos(star.angle) * r,
    y:
      cy +
      Math.sin(star.angle) * r * layer.yScale +
      scrollSpeed * layer.driftMult * SCROLL_TO_DRIFT,
  }
}

export function drawStars(
  ctx: CanvasRenderingContext2D,
  stars: Star[],
  layer: LayerConfig,
  scrollSpeed: number,
  width: number,
  height: number,
): void {
  const cx = width / 2
  const cy = height / 2
  // Half-diagonal, so max-radius orbits reach the corners.
  const maxRadius = Math.hypot(cx, cy)
  ctx.fillStyle = layer.color
  // One batched path + fill per layer: per-star fill() calls flush the
  // rasterizer hundreds of times a frame and stutter on mobile GPUs.
  ctx.beginPath()
  for (const star of stars) {
    const { x, y } = projectStar(star, layer, scrollSpeed, cx, cy, maxRadius)
    ctx.moveTo(x + star.size, y)
    ctx.arc(x, y, star.size, 0, TWO_PI)
  }
  ctx.fill()
}
```

- [ ] **Step 7: Write the failing engine test**

Create `src/starfield/__tests__/engine.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { CLOSE_LAYER, FAR_LAYER, SCROLL_TO_ANGULAR, SCROLL_TO_DRIFT, SEEDS } from '../config'
import { approach, createStars, projectStar, updateStars } from '../engine'
import type { Star } from '../types'

const makeStar = (overrides: Partial<Star> = {}): Star => ({
  angle: 0,
  radius: 0.5,
  speed: 0.05,
  size: 2,
  ...overrides,
})

describe('createStars', () => {
  it('creates the configured number of stars', () => {
    expect(createStars(CLOSE_LAYER, SEEDS, 0)).toHaveLength(CLOSE_LAYER.count)
    expect(createStars(FAR_LAYER, SEEDS, 1)).toHaveLength(FAR_LAYER.count)
  })

  it('keeps sizes and speeds within the layer ranges', () => {
    for (const star of createStars(CLOSE_LAYER, SEEDS, 0)) {
      expect(star.size).toBeGreaterThanOrEqual(CLOSE_LAYER.sizeMin)
      expect(star.size).toBeLessThanOrEqual(CLOSE_LAYER.sizeMax)
      expect(star.speed).toBeGreaterThanOrEqual(CLOSE_LAYER.speedMin)
      expect(star.speed).toBeLessThanOrEqual(CLOSE_LAYER.speedMax)
      expect(star.radius).toBeGreaterThan(0)
      expect(star.radius).toBeLessThanOrEqual(1)
    }
  })

  it('is deterministic for fixed seeds', () => {
    expect(createStars(CLOSE_LAYER, SEEDS, 0)).toEqual(createStars(CLOSE_LAYER, SEEDS, 0))
  })

  it('draws size and speed from independent seed streams', () => {
    const base = createStars(CLOSE_LAYER, SEEDS, 0)
    const differentSizeSeed = createStars(CLOSE_LAYER, { ...SEEDS, size: SEEDS.size + 1 }, 0)
    expect(differentSizeSeed.map((s) => s.size)).not.toEqual(base.map((s) => s.size))
    expect(differentSizeSeed.map((s) => s.speed)).toEqual(base.map((s) => s.speed))
    expect(differentSizeSeed.map((s) => s.angle)).toEqual(base.map((s) => s.angle))
  })
})

describe('updateStars', () => {
  it('advances angle by speed * speedMult * dt when scroll is zero', () => {
    const star = makeStar({ speed: 0.05 })
    updateStars([star], CLOSE_LAYER, 0, 2)
    expect(star.angle).toBeCloseTo(0.05 * CLOSE_LAYER.speedMult * 2, 10)
  })

  it('applies each layer’s speed and scroll multipliers', () => {
    const scroll = 500
    const dt = 1
    for (const layer of [CLOSE_LAYER, FAR_LAYER]) {
      const star = makeStar({ speed: 0.05 })
      updateStars([star], layer, scroll, dt)
      expect(star.angle).toBeCloseTo(
        (0.05 * layer.speedMult + scroll * layer.scrollMult * SCROLL_TO_ANGULAR) * dt,
        10,
      )
    }
  })

  it('reverses the scroll contribution for negative scroll speed', () => {
    const star = makeStar({ speed: 0 })
    updateStars([star], CLOSE_LAYER, -500, 1)
    expect(star.angle).toBeCloseTo(-500 * CLOSE_LAYER.scrollMult * SCROLL_TO_ANGULAR, 10)
  })
})

describe('approach', () => {
  it('returns the target when within maxDelta', () => {
    expect(approach(10, 12, 5)).toBe(12)
    expect(approach(10, 7, 5)).toBe(7)
  })

  it('limits the step to maxDelta in either direction', () => {
    expect(approach(0, 1000, 30)).toBe(30)
    expect(approach(0, -1000, 30)).toBe(-30)
  })

  it('is stable at the target', () => {
    expect(approach(42, 42, 5)).toBe(42)
  })

  it('does not move for zero or negative maxDelta (garbage frame times)', () => {
    expect(approach(10, 500, 0)).toBe(10)
    expect(approach(10, 500, -1e12)).toBe(10)
    expect(approach(10, 10, -1e12)).toBe(10)
  })
})

describe('projectStar', () => {
  const cx = 400
  const cy = 300
  const maxRadius = 500

  it('places close-layer stars on a circle around the center', () => {
    const star = makeStar({ angle: Math.PI / 3, radius: 0.8 })
    const { x, y } = projectStar(star, CLOSE_LAYER, 0, cx, cy, maxRadius)
    const dist = Math.hypot(x - cx, y - cy)
    expect(dist).toBeCloseTo(0.8 * maxRadius, 8)
  })

  it('stretches the far layer y-offset by 1.5 (oval orbit)', () => {
    expect(FAR_LAYER.yScale).toBe(1.5)
    const star = makeStar({ angle: Math.PI / 4, radius: 0.6 })
    const close = projectStar(star, CLOSE_LAYER, 0, cx, cy, maxRadius)
    const far = projectStar(star, FAR_LAYER, 0, cx, cy, maxRadius)
    expect(far.x).toBeCloseTo(close.x, 8)
    expect(far.y - cy).toBeCloseTo((close.y - cy) * 1.5, 8)
  })

  it('adds a pure vertical drift scaled by the layer driftMult', () => {
    const star = makeStar({ angle: 1.1, radius: 0.4 })
    const rest = projectStar(star, CLOSE_LAYER, 0, cx, cy, maxRadius)
    const scrolled = projectStar(star, CLOSE_LAYER, 200, cx, cy, maxRadius)
    expect(scrolled.x).toBe(rest.x)
    expect(scrolled.y - rest.y).toBeCloseTo(200 * CLOSE_LAYER.driftMult * SCROLL_TO_DRIFT, 8)
  })

  it('drift is independent of scrollMult and differs per layer via driftMult', () => {
    const star = makeStar({ angle: 0, radius: 0.4 })
    const layer = { ...CLOSE_LAYER, scrollMult: 99, driftMult: 2 }
    const rest = projectStar(star, layer, 0, cx, cy, maxRadius)
    const scrolled = projectStar(star, layer, 100, cx, cy, maxRadius)
    expect(scrolled.y - rest.y).toBeCloseTo(100 * 2 * SCROLL_TO_DRIFT, 8)
  })
})
```

- [ ] **Step 8: Run the engine test**

Run: `npx vitest run src/starfield/__tests__/engine.spec.ts`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/starfield
git commit -m "feat: port starfield star-field engine from sibling starfield project"
```

---

## Task 3: Port the scroll-velocity composables

**Files:**

- Create: `src/composables/scrollInputs.ts`
- Create: `src/composables/useScrollVelocity.ts`
- Test: `src/composables/__tests__/scrollInputs.spec.ts`
- Test: `src/composables/__tests__/useScrollVelocity.spec.ts`

**Interfaces:**

- Consumes: nothing from earlier tasks (only `animejs`, installed in Task 1).
- Produces: `wheelInput`, `touchInput`, `ScrollInput`, `ScrollInputOptions` from `scrollInputs.ts`; `useScrollVelocity(target?, sources?): ScrollVelocity`, `ScrollVelocity`, `DECAY_DELAY`, `DECAY_DURATION` from `useScrollVelocity.ts` — consumed by `StarfieldBackground.vue` in Task 4.

- [ ] **Step 1: Create `src/composables/scrollInputs.ts`**

```ts
/**
 * A scroll input source: attaches listeners to the target, converts events
 * into signed velocity deltas (positive = scrolling down), reports them via
 * emit, and returns a detach function. All source-private state lives inside.
 */
export type ScrollInput = (target: EventTarget, emit: (delta: number) => void) => () => void

export interface ScrollInputOptions {
  /** Scales the device's native delta units into velocity units. */
  gain?: number
}

const WHEEL_GAIN = 1
/** Touchmove deltas are a few px per event vs ~100 per wheel notch. */
const TOUCH_GAIN = 1.5

/** Mouse wheel / trackpad: forwards deltaY scaled by gain. */
export function wheelInput(options?: ScrollInputOptions): ScrollInput {
  const gain = options?.gain ?? WHEEL_GAIN
  return (target, emit) => {
    const onWheel = (event: Event) => {
      emit((event as WheelEvent).deltaY * gain)
    }
    target.addEventListener('wheel', onWheel, { passive: true })
    return () => target.removeEventListener('wheel', onWheel)
  }
}

/** Touch drag: finger up = scrolling down = positive, matching wheel. */
export function touchInput(options?: ScrollInputOptions): ScrollInput {
  const gain = options?.gain ?? TOUCH_GAIN
  return (target, emit) => {
    let lastTouchY: number | undefined
    let touchId: number | undefined

    const seedTouch = (event: Event) => {
      const touch = (event as TouchEvent).touches[0]
      touchId = touch?.identifier
      lastTouchY = touch?.clientY
    }

    const onTouchMove = (event: Event) => {
      const touch = (event as TouchEvent).touches[0]
      if (!touch) return
      // If touches[0] is suddenly a different finger (second finger down, or
      // one of two lifted), a delta across the two positions would be garbage
      // and lurch the stars — re-seed and wait for the next move instead.
      if (touch.identifier !== touchId || lastTouchY === undefined) {
        touchId = touch.identifier
        lastTouchY = touch.clientY
        return
      }
      emit((lastTouchY - touch.clientY) * gain)
      lastTouchY = touch.clientY
    }

    target.addEventListener('touchstart', seedTouch, { passive: true })
    target.addEventListener('touchmove', onTouchMove, { passive: true })
    // On (partial) release, re-seed from whichever touch remains, if any.
    target.addEventListener('touchend', seedTouch, { passive: true })
    target.addEventListener('touchcancel', seedTouch, { passive: true })
    return () => {
      target.removeEventListener('touchstart', seedTouch)
      target.removeEventListener('touchmove', onTouchMove)
      target.removeEventListener('touchend', seedTouch)
      target.removeEventListener('touchcancel', seedTouch)
    }
  }
}
```

- [ ] **Step 2: Write the failing scrollInputs test**

Create `src/composables/__tests__/scrollInputs.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { touchInput, wheelInput } from '../scrollInputs'

function wheel(target: EventTarget, deltaY: number) {
  const event = new Event('wheel')
  Object.assign(event, { deltaY })
  target.dispatchEvent(event)
}

function touch(
  target: EventTarget,
  type: 'touchstart' | 'touchmove' | 'touchend',
  clientY = 0,
  identifier = 0,
) {
  const event = new Event(type)
  Object.assign(event, { touches: type === 'touchend' ? [] : [{ clientY, identifier }] })
  target.dispatchEvent(event)
}

function collect(): { deltas: number[]; emit: (delta: number) => void } {
  const deltas: number[] = []
  return { deltas, emit: (delta) => deltas.push(delta) }
}

describe('wheelInput', () => {
  it('forwards deltaY scaled by the default gain', () => {
    const target = new EventTarget()
    const { deltas, emit } = collect()
    const detach = wheelInput()(target, emit)

    wheel(target, 120)
    wheel(target, -50)
    expect(deltas).toEqual([120, -50])
    detach()
  })

  it('applies a custom gain', () => {
    const target = new EventTarget()
    const { deltas, emit } = collect()
    const detach = wheelInput({ gain: 2 })(target, emit)

    wheel(target, 100)
    expect(deltas).toEqual([200])
    detach()
  })

  it('stops emitting after detach', () => {
    const target = new EventTarget()
    const { deltas, emit } = collect()
    const detach = wheelInput()(target, emit)

    detach()
    wheel(target, 100)
    expect(deltas).toEqual([])
  })
})

describe('touchInput', () => {
  it('emits positive deltas for an upward drag (scroll down)', () => {
    const target = new EventTarget()
    const { deltas, emit } = collect()
    const detach = touchInput({ gain: 1 })(target, emit)

    touch(target, 'touchstart', 500)
    touch(target, 'touchmove', 460)
    touch(target, 'touchmove', 430)
    expect(deltas).toEqual([40, 30])
    detach()
  })

  it('emits negative deltas for a downward drag (scroll up)', () => {
    const target = new EventTarget()
    const { deltas, emit } = collect()
    const detach = touchInput({ gain: 1 })(target, emit)

    touch(target, 'touchstart', 200)
    touch(target, 'touchmove', 260)
    expect(deltas).toEqual([-60])
    detach()
  })

  it('applies the gain to drag distances', () => {
    const target = new EventTarget()
    const { deltas, emit } = collect()
    const detach = touchInput({ gain: 1.5 })(target, emit)

    touch(target, 'touchstart', 100)
    touch(target, 'touchmove', 90)
    expect(deltas).toEqual([15])
    detach()
  })

  it('ignores touchmove without a preceding touchstart', () => {
    const target = new EventTarget()
    const { deltas, emit } = collect()
    const detach = touchInput()(target, emit)

    touch(target, 'touchmove', 300)
    expect(deltas).toEqual([])
    detach()
  })

  it('re-seeds instead of emitting when the tracked finger changes', () => {
    const target = new EventTarget()
    const { deltas, emit } = collect()
    const detach = touchInput({ gain: 1 })(target, emit)

    touch(target, 'touchstart', 500, 1)
    touch(target, 'touchmove', 490, 1) // legit: +10
    touch(target, 'touchmove', 50, 2) // finger switch: no delta
    touch(target, 'touchmove', 45, 2) // legit on new finger: +5
    expect(deltas).toEqual([10, 5])
    detach()
  })

  it('re-seeds on touchend so the next gesture starts clean', () => {
    const target = new EventTarget()
    const { deltas, emit } = collect()
    const detach = touchInput({ gain: 1 })(target, emit)

    touch(target, 'touchstart', 500)
    touch(target, 'touchmove', 480) // +20
    touch(target, 'touchend')
    touch(target, 'touchmove', 100) // stale state must not produce a delta
    expect(deltas).toEqual([20])
    detach()
  })

  it('stops emitting after detach', () => {
    const target = new EventTarget()
    const { deltas, emit } = collect()
    const detach = touchInput()(target, emit)

    touch(target, 'touchstart', 500)
    detach()
    touch(target, 'touchmove', 400)
    expect(deltas).toEqual([])
  })
})
```

- [ ] **Step 3: Run the scrollInputs test**

Run: `npx vitest run src/composables/__tests__/scrollInputs.spec.ts`
Expected: PASS.

- [ ] **Step 4: Create `src/composables/useScrollVelocity.ts`**

```ts
import { createAnimatable, utils } from 'animejs'
import { touchInput, wheelInput, type ScrollInput } from './scrollInputs'

const MAX_SPEED = 3000
/** How long anime eases toward a new input target (ms). */
const SMOOTH_DURATION = 350
/** Idle time after the last input before gliding back to rest (ms). */
export const DECAY_DELAY = 150
/** How long the glide back to zero takes (ms). */
export const DECAY_DURATION = 2400

export interface ScrollVelocity {
  /** Current smoothed scroll speed (positive = scrolling down). */
  readonly speed: number
  destroy(): void
}

/**
 * Accumulates deltas from the given input sources into a target velocity and
 * lets anime.js smooth the actual value toward it; after a short idle it
 * eases back to zero. The page decides which inputs feed it (defaults to
 * wheel + touch). Framework-free so it can be unit-tested; the caller owns
 * the lifecycle (call destroy() on unmount).
 *
 * There is no runtime device detection: every source in `sources` is
 * attached and stays active for the lifetime of this instance. With the
 * default, both wheel and touch listeners are registered on every device —
 * the source whose events never fire simply stays silent. To restrict or
 * tune inputs, pass an explicit array, e.g.
 * `useScrollVelocity(window, [touchInput({ gain: 2 })])`.
 */
export function useScrollVelocity(
  target: EventTarget = window,
  sources: ScrollInput[] = [wheelInput(), touchInput()],
): ScrollVelocity {
  const state = { speed: 0 }
  const animatable = createAnimatable(state, {
    speed: SMOOTH_DURATION,
    ease: 'out(2)',
  })
  // AnimatableObject uses an index signature, so grab the property once and
  // assert it exists (createAnimatable always defines it for `speed` above).
  const animateSpeed = animatable.speed!
  let decayTimeout: ReturnType<typeof setTimeout> | undefined
  // Accumulate on an explicit target rather than the smoothed state.speed:
  // the smoothed value lags behind, so "state.speed + small delta" would let
  // a gentle input override a higher target still being eased toward.
  let targetSpeed = 0
  let decaying = false

  const applyDelta = (delta: number) => {
    if (decaying) {
      // Resume from wherever the glide-to-zero has actually reached.
      targetSpeed = state.speed
      decaying = false
    }
    targetSpeed = utils.clamp(targetSpeed + delta, -MAX_SPEED, MAX_SPEED)
    animateSpeed(targetSpeed)
    clearTimeout(decayTimeout)
    decayTimeout = setTimeout(() => {
      decaying = true
      targetSpeed = 0
      animateSpeed(0, DECAY_DURATION)
    }, DECAY_DELAY)
  }

  // Attach every source unconditionally; all of them feed the same sink.
  const detachFns = sources.map((source) => source(target, applyDelta))

  return {
    get speed() {
      return state.speed
    },
    destroy() {
      for (const detach of detachFns) detach()
      clearTimeout(decayTimeout)
      animatable.revert()
    },
  }
}
```

- [ ] **Step 5: Write the failing useScrollVelocity test**

Create `src/composables/__tests__/useScrollVelocity.spec.ts`:

```ts
import { afterEach, describe, expect, it } from 'vitest'
import {
  DECAY_DELAY,
  DECAY_DURATION,
  useScrollVelocity,
  type ScrollVelocity,
} from '../useScrollVelocity'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function wheel(target: EventTarget, deltaY: number) {
  // Node has no WheelEvent; a plain Event with deltaY attached matches
  // everything the composable reads.
  const event = new Event('wheel')
  Object.assign(event, { deltaY })
  target.dispatchEvent(event)
}

function touch(
  target: EventTarget,
  type: 'touchstart' | 'touchmove' | 'touchend',
  clientY = 0,
  identifier = 0,
) {
  // Same trick for TouchEvent: only touches[0].clientY/identifier are read.
  const event = new Event(type)
  Object.assign(event, { touches: type === 'touchend' ? [] : [{ clientY, identifier }] })
  target.dispatchEvent(event)
}

describe('useScrollVelocity', () => {
  let velocity: ScrollVelocity | undefined

  afterEach(() => {
    velocity?.destroy()
    velocity = undefined
  })

  it('ramps up gradually instead of jumping to the wheel delta', async () => {
    const target = new EventTarget()
    velocity = useScrollVelocity(target)

    wheel(target, 500)
    expect(Math.abs(velocity.speed)).toBeLessThan(50) // no instant jump

    await sleep(120)
    const mid = velocity.speed
    expect(mid).toBeGreaterThan(0)
    expect(mid).toBeLessThanOrEqual(500)
  })

  it('preserves the scroll direction sign', async () => {
    const target = new EventTarget()
    velocity = useScrollVelocity(target)

    wheel(target, -300)
    await sleep(120)
    expect(velocity.speed).toBeLessThan(0)
  })

  it('ramps up positive on an upward finger drag (scroll down)', async () => {
    const target = new EventTarget()
    velocity = useScrollVelocity(target)

    touch(target, 'touchstart', 500)
    touch(target, 'touchmove', 460)
    touch(target, 'touchmove', 420)
    expect(Math.abs(velocity.speed)).toBeLessThan(50) // no instant jump
    touch(target, 'touchend')

    await sleep(120)
    expect(velocity.speed).toBeGreaterThan(0)
  })

  it('goes negative on a downward finger drag (scroll up)', async () => {
    const target = new EventTarget()
    velocity = useScrollVelocity(target)

    touch(target, 'touchstart', 200)
    touch(target, 'touchmove', 260)
    touch(target, 'touchend')

    await sleep(120)
    expect(velocity.speed).toBeLessThan(0)
  })

  it('ignores touchmove without a preceding touchstart', async () => {
    const target = new EventTarget()
    velocity = useScrollVelocity(target)

    touch(target, 'touchmove', 300)
    await sleep(120)
    expect(velocity.speed).toBe(0)
  })

  it('re-seeds instead of computing a delta when the tracked finger changes', async () => {
    const target = new EventTarget()
    velocity = useScrollVelocity(target)

    touch(target, 'touchstart', 500, 1)
    touch(target, 'touchmove', 490, 1) // small legit delta: +10
    // touches[0] becomes a different finger far away — must not read as a
    // 440px swipe.
    touch(target, 'touchmove', 50, 2)
    touch(target, 'touchmove', 45, 2) // small legit delta on the new finger

    await sleep(400)
    expect(velocity.speed).toBeGreaterThan(0)
    expect(velocity.speed).toBeLessThan(100) // only the two small deltas
  })

  it('does not let a small delta override a higher pending target', async () => {
    const target = new EventTarget()
    velocity = useScrollVelocity(target)

    wheel(target, 1000)
    await sleep(100) // smoothed value still well below the 1000 target
    const mid = velocity.speed
    expect(mid).toBeGreaterThan(0)
    expect(mid).toBeLessThan(1000)

    // A gentle follow-up input must keep easing toward ~1005, not retarget
    // down to "current smoothed value + 5".
    wheel(target, 5)
    await sleep(400)
    expect(velocity.speed).toBeGreaterThan(mid + 50)
  })

  it('decays back toward zero after input stops', async () => {
    const target = new EventTarget()
    velocity = useScrollVelocity(target)

    wheel(target, 400)
    await sleep(300)
    const peak = Math.abs(velocity.speed)
    expect(peak).toBeGreaterThan(0)

    // idle delay + full glide back to zero + margin
    await sleep(DECAY_DELAY + DECAY_DURATION + 300)
    expect(Math.abs(velocity.speed)).toBeLessThan(peak * 0.05)
    expect(Math.abs(velocity.speed)).toBeLessThan(5)
  })
})
```

- [ ] **Step 6: Run the useScrollVelocity test**

Run: `npx vitest run src/composables/__tests__/useScrollVelocity.spec.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/composables/scrollInputs.ts src/composables/useScrollVelocity.ts src/composables/__tests__/scrollInputs.spec.ts src/composables/__tests__/useScrollVelocity.spec.ts
git commit -m "feat: port scroll-velocity composables from sibling starfield project"
```

---

## Task 4: Port `StarfieldBackground.vue`

**Files:**

- Create: `src/components/StarfieldBackground.vue`

**Interfaces:**

- Consumes: `LAYERS`, `MAX_DPR`, `MAX_FRAME_TIME`, `SEEDS`, `SPEED_SLEW` from `src/starfield/config.ts`; `approach`, `createStars`, `drawStars`, `updateStars` from `src/starfield/engine.ts`; `useScrollVelocity`, `ScrollVelocity` from `src/composables/useScrollVelocity.ts` (all from Tasks 2–3).
- Produces: a `<StarfieldBackground />` component with no props, rendered once in `App.vue` (Task 13).

- [ ] **Step 1: Create `src/components/StarfieldBackground.vue`**

```vue
<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from 'vue'
import { createTimer, type Timer } from 'animejs'
import { useScrollVelocity, type ScrollVelocity } from '@/composables/useScrollVelocity'
import { LAYERS, MAX_DPR, MAX_FRAME_TIME, SEEDS, SPEED_SLEW } from '@/starfield/config'
import { approach, createStars, drawStars, updateStars } from '@/starfield/engine'

const canvasRef = useTemplateRef('canvas')

let timer: Timer | undefined
let scroll: ScrollVelocity | undefined

// Cached CSS-pixel size of the canvas so the render loop never reads layout.
let viewWidth = 0
let viewHeight = 0

function resizeCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  const backingWidth = Math.round(width * dpr)
  // Reallocating the backing store is expensive and blanks the canvas for a
  // frame — skip when nothing actually changed (mobile fires spurious
  // resizes while the URL bar shows/hides during scrolling).
  if (width === viewWidth && height === viewHeight && canvas.width === backingWidth) return
  viewWidth = width
  viewHeight = height
  canvas.width = backingWidth
  canvas.height = Math.round(height * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

let onResize: (() => void) | undefined

onMounted(() => {
  const canvas = canvasRef.value
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) return

  resizeCanvas(canvas, ctx)
  onResize = () => resizeCanvas(canvas, ctx)
  window.addEventListener('resize', onResize)

  const layers = LAYERS.map((layer, index) => ({
    layer,
    stars: createStars(layer, SEEDS, index),
  }))
  // Default sources: wheel + touch, both always attached (no device
  // detection); pass a ScrollInput[] here to restrict or tune inputs.
  scroll = useScrollVelocity()

  // Speed value actually used for rendering: follows scroll.speed but with a
  // bounded rate of change, so a frame stall (common during touch scrolling)
  // can't make the drift offset — a direct function of speed — jump.
  let renderSpeed = 0

  timer = createTimer({
    onUpdate: (self) => {
      // Clamp both sides: anime can report garbage (even hugely negative)
      // deltaTime on the first ticks, and unlike the periodic angles, the
      // slew-limited renderSpeed would be permanently poisoned by it.
      const dt = Math.min(Math.max(self.deltaTime, 0), MAX_FRAME_TIME * 1000) / 1000
      renderSpeed = approach(renderSpeed, scroll!.speed, SPEED_SLEW * dt)
      const speed = renderSpeed
      ctx.clearRect(0, 0, viewWidth, viewHeight)
      for (const { layer, stars } of layers) {
        updateStars(stars, layer, speed, dt)
        drawStars(ctx, stars, layer, speed, viewWidth, viewHeight)
      }
    },
  })
})

onUnmounted(() => {
  timer?.cancel()
  scroll?.destroy()
  if (onResize) window.removeEventListener('resize', onResize)
})
</script>

<template>
  <canvas
    ref="canvas"
    class="pointer-events-none fixed inset-0 z-0 h-lvh w-screen"
    aria-hidden="true"
  ></canvas>
</template>
```

- [ ] **Step 2: Verify it compiles**

Run: `npx vue-tsc --build --force`
Expected: no type errors. (This component has no unit test — same as the source `starfield` project, since jsdom has no real canvas/`getContext` implementation to assert against; it's exercised visually once wired into `App.vue` in Task 13.)

- [ ] **Step 3: Commit**

```bash
git add src/components/StarfieldBackground.vue
git commit -m "feat: port StarfieldBackground component from sibling starfield project"
```

---

## Task 5: `useSpinner` composable (pure frame math + drag/inertia)

**Files:**

- Create: `src/composables/useSpinner.ts`
- Test: `src/composables/__tests__/useSpinner.spec.ts`

**Interfaces:**

- Consumes: `animate` from `animejs`.
- Produces: `FRAME_COUNT` (16), `normalizeFrame(frame, total?): number`, `frameFromDrag(startFrame, dragDeltaX, sensitivity): number` (pure, exported for testing), and `useSpinner(imgRef: Ref<HTMLImageElement | null>, frames: string[], options?: { sensitivity?: number }): { onPointerDown: (e: PointerEvent) => void; playIntroSpin: () => void }` — consumed by `ProductSpinner.vue` in Task 6.

- [ ] **Step 1: Write the failing pure-function tests**

Create `src/composables/__tests__/useSpinner.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { FRAME_COUNT, frameFromDrag, normalizeFrame } from '../useSpinner'

describe('normalizeFrame', () => {
  it('wraps positive overflow into [0, total)', () => {
    expect(normalizeFrame(16, 16)).toBe(0)
    expect(normalizeFrame(17, 16)).toBe(1)
    expect(normalizeFrame(32, 16)).toBe(0)
  })

  it('wraps negative values into [0, total)', () => {
    expect(normalizeFrame(-1, 16)).toBe(15)
    expect(normalizeFrame(-17, 16)).toBe(15)
  })

  it('rounds fractional frames before wrapping', () => {
    expect(normalizeFrame(3.6, 16)).toBe(4)
    expect(normalizeFrame(-0.6, 16)).toBe(15)
  })

  it('defaults total to FRAME_COUNT (16)', () => {
    expect(normalizeFrame(16)).toBe(0)
    expect(FRAME_COUNT).toBe(16)
  })
})

describe('frameFromDrag', () => {
  it('returns the start frame when drag distance is zero', () => {
    expect(frameFromDrag(5, 0, 1)).toBe(5)
  })

  it('advances one frame per 28px of drag at sensitivity 1', () => {
    expect(frameFromDrag(0, 28, 1)).toBeCloseTo(1, 10)
    expect(frameFromDrag(0, -28, 1)).toBeCloseTo(-1, 10)
  })

  it('scales the drag-to-frame ratio by sensitivity', () => {
    expect(frameFromDrag(0, 28, 2)).toBeCloseTo(2, 10)
    expect(frameFromDrag(0, 14, 2)).toBeCloseTo(1, 10)
  })

  it('adds the delta on top of a non-zero start frame', () => {
    expect(frameFromDrag(10, 56, 1)).toBeCloseTo(12, 10)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/composables/__tests__/useSpinner.spec.ts`
Expected: FAIL with "Cannot find module '../useSpinner'" (the file doesn't exist yet).

- [ ] **Step 3: Create `src/composables/useSpinner.ts`**

```ts
import { animate } from 'animejs'
import type { Ref } from 'vue'

export const FRAME_COUNT = 16

/** Wraps a (possibly fractional, possibly out-of-range) frame into [0, total). */
export function normalizeFrame(frame: number, total: number = FRAME_COUNT): number {
  return ((Math.round(frame) % total) + total) % total
}

/** One frame of rotation per (28 / sensitivity) px of horizontal drag. */
export function frameFromDrag(startFrame: number, dragDeltaX: number, sensitivity: number): number {
  return startFrame + dragDeltaX / (28 / sensitivity)
}

export interface UseSpinnerOptions {
  /** Higher = more frames per pixel dragged. Default 1. */
  sensitivity?: number
}

export interface Spinner {
  onPointerDown: (event: PointerEvent) => void
  /** Plays one full auto-rotation, matching the hero's mount-time intro. */
  playIntroSpin: () => void
}

/**
 * Drag-to-rotate logic for the product spinner. Mutates `imgRef`'s `src`
 * directly on every frame change instead of going through Vue reactivity —
 * during a fast drag that would mean a render per pointermove, which stutters.
 */
export function useSpinner(
  imgRef: Ref<HTMLImageElement | null>,
  frames: string[],
  options: UseSpinnerOptions = {},
): Spinner {
  const sensitivity = options.sensitivity ?? 1
  let currentFrame = 0
  let spinProxy: { frame: number } | undefined

  function setFrame(frame: number) {
    currentFrame = frame
    const src = frames[normalizeFrame(frame, frames.length)]
    if (imgRef.value && src) imgRef.value.src = src
  }

  function animateFrames(to: number, duration: number, ease: string) {
    spinProxy = { frame: currentFrame }
    animate(spinProxy, {
      frame: to,
      duration,
      ease,
      onUpdate: () => setFrame(spinProxy!.frame),
    })
  }

  function onPointerDown(event: PointerEvent) {
    event.preventDefault()
    const stage = event.currentTarget as HTMLElement
    stage.style.cursor = 'grabbing'
    const startX = event.clientX
    const startFrame = currentFrame
    let lastX = event.clientX
    let lastT = performance.now()
    let velocity = 0

    const onMove = (moveEvent: PointerEvent) => {
      const now = performance.now()
      velocity = (moveEvent.clientX - lastX) / Math.max(now - lastT, 1)
      lastX = moveEvent.clientX
      lastT = now
      setFrame(frameFromDrag(startFrame, moveEvent.clientX - startX, sensitivity))
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      stage.style.cursor = 'grab'
      // Inertia: convert px/ms velocity into extra frames, ease out.
      const extra = velocity * 14 * sensitivity
      if (Math.abs(extra) > 0.5) {
        animateFrames(currentFrame + extra, Math.min(1400, 300 + Math.abs(extra) * 90), 'outQuart')
      }
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  function playIntroSpin() {
    animateFrames(FRAME_COUNT, 2600, 'inOutCubic')
  }

  return { onPointerDown, playIntroSpin }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/composables/__tests__/useSpinner.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/composables/useSpinner.ts src/composables/__tests__/useSpinner.spec.ts
git commit -m "feat: add useSpinner composable for drag-to-rotate product spinner"
```

---

## Task 6: `ProductSpinner.vue`

**Files:**

- Create: `src/content/controllerFrames.ts`
- Create: `src/components/ProductSpinner.vue`
- Test: `src/components/__tests__/ProductSpinner.spec.ts`

**Interfaces:**

- Consumes: `useSpinner`, `Spinner` from `src/composables/useSpinner.ts` (Task 5).
- Produces: `CONTROLLER_FRAMES: string[]` (16 resolved asset URLs, ascending) from `controllerFrames.ts`; a `<ProductSpinner />` component (no props) exposing `{ playIntroSpin(): void }` via `defineExpose`, consumed by `HeroSection.vue` in Task 7.

- [ ] **Step 1: Create `src/content/controllerFrames.ts`**

```ts
const frameModules = import.meta.glob<{ default: string }>('@/assets/controller-render/*.png', {
  eager: true,
})

/** The 16 spinner frames, sorted ascending by filename (0001.png .. 0016.png). */
export const CONTROLLER_FRAMES: string[] = Object.keys(frameModules)
  .sort()
  .map((key) => frameModules[key]!.default)
```

- [ ] **Step 2: Write the failing component test**

Create `src/components/__tests__/ProductSpinner.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductSpinner from '../ProductSpinner.vue'
import { CONTROLLER_FRAMES } from '@/content/controllerFrames'

describe('ProductSpinner', () => {
  it('renders 16 controller frames and starts on the first one', () => {
    expect(CONTROLLER_FRAMES).toHaveLength(16)

    const wrapper = mount(ProductSpinner)
    const img = wrapper.get('img')
    expect(img.attributes('src')).toBe(CONTROLLER_FRAMES[0])
  })

  it('exposes playIntroSpin', () => {
    const wrapper = mount(ProductSpinner)
    expect(typeof wrapper.vm.playIntroSpin).toBe('function')
    expect(() => wrapper.vm.playIntroSpin()).not.toThrow()
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run src/components/__tests__/ProductSpinner.spec.ts`
Expected: FAIL with "Cannot find module '../ProductSpinner.vue'".

- [ ] **Step 4: Create `src/components/ProductSpinner.vue`**

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useSpinner } from '@/composables/useSpinner'
import { CONTROLLER_FRAMES } from '@/content/controllerFrames'

const imgRef = useTemplateRef('image')
const { onPointerDown, playIntroSpin } = useSpinner(imgRef, CONTROLLER_FRAMES)

defineExpose({ playIntroSpin })
</script>

<template>
  <div
    data-spin-stage
    class="mx-auto flex aspect-square w-full max-w-[420px] cursor-grab touch-none select-none items-center justify-center opacity-0"
    @pointerdown="onPointerDown"
  >
    <img
      ref="image"
      :src="CONTROLLER_FRAMES[0]"
      alt="Customs chrome controller shell, rotating product view"
      draggable="false"
      class="pointer-events-none w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
    />
  </div>
</template>
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/components/__tests__/ProductSpinner.spec.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/content/controllerFrames.ts src/components/ProductSpinner.vue src/components/__tests__/ProductSpinner.spec.ts
git commit -m "feat: add ProductSpinner component"
```

---

## Task 7: `AppNav.vue`

**Files:**

- Create: `src/components/AppNav.vue`
- Test: `src/components/__tests__/AppNav.spec.ts`

**Interfaces:**

- Consumes: `src/assets/logo.png`.
- Produces: a `<AppNav />` component (no props), consumed by `App.vue` in Task 13.

- [ ] **Step 1: Write the failing component test**

Create `src/components/__tests__/AppNav.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AppNav from '../AppNav.vue'

describe('AppNav', () => {
  it('renders the wordmark and a logo image', () => {
    const wrapper = mount(AppNav)
    expect(wrapper.text()).toContain('Customs')
    expect(wrapper.get('img').attributes('alt')).toContain('Customs')
  })

  it('links to the hero anchor', () => {
    const wrapper = mount(AppNav)
    expect(wrapper.get('a').attributes('href')).toBe('#top')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/__tests__/AppNav.spec.ts`
Expected: FAIL with "Cannot find module '../AppNav.vue'".

- [ ] **Step 3: Create `src/components/AppNav.vue`**

```vue
<script setup lang="ts">
import logo from '@/assets/logo.png'
</script>

<template>
  <nav data-reveal="nav" class="grid grid-cols-[1fr_auto_1fr] items-center py-8 opacity-0">
    <a href="#top" class="col-start-2 col-end-3 flex items-center justify-self-center gap-4">
      <img :src="logo" alt="Customs logo" class="h-9 w-9 [image-rendering:pixelated] invert" />
      <span class="-translate-y-0.5 font-mono text-[34px] leading-none text-[rgba(242,242,244,0.5)]"
        >×</span
      >
      <span class="font-hand text-3xl tracking-wide">Customs</span>
    </a>
  </nav>
</template>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/__tests__/AppNav.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/AppNav.vue src/components/__tests__/AppNav.spec.ts
git commit -m "feat: add AppNav component"
```

---

## Task 8: `HeroSection.vue`

**Files:**

- Create: `src/components/HeroSection.vue`
- Test: `src/components/__tests__/HeroSection.spec.ts`

**Interfaces:**

- Consumes: `ProductSpinner.vue` (Task 6).
- Produces: a `<HeroSection />` component (no props) exposing `{ playIntroSpin(): void }` via `defineExpose` (forwarded from the inner `ProductSpinner`), consumed by `App.vue` in Task 13.

- [ ] **Step 1: Write the failing component test**

Create `src/components/__tests__/HeroSection.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import HeroSection from '../HeroSection.vue'

describe('HeroSection', () => {
  it('renders the headline and subhead', () => {
    const wrapper = mount(HeroSection)
    expect(wrapper.text()).toContain('Your controller.')
    expect(wrapper.text()).toContain('Chromed.')
    expect(wrapper.text()).toContain('mirror-polished')
  })

  it('renders the product spinner', () => {
    const wrapper = mount(HeroSection)
    expect(wrapper.find('img[alt*="Customs"]').exists()).toBe(true)
  })

  it('forwards playIntroSpin to the spinner', () => {
    const wrapper = mount(HeroSection)
    expect(typeof wrapper.vm.playIntroSpin).toBe('function')
    expect(() => wrapper.vm.playIntroSpin()).not.toThrow()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/__tests__/HeroSection.spec.ts`
Expected: FAIL with "Cannot find module '../HeroSection.vue'".

- [ ] **Step 3: Create `src/components/HeroSection.vue`**

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import ProductSpinner from './ProductSpinner.vue'

const spinnerRef = useTemplateRef('spinner')

defineExpose({
  playIntroSpin: () => spinnerRef.value?.playIntroSpin(),
})
</script>

<template>
  <section id="top" class="grid grid-cols-1 justify-items-center px-0 pb-8 pt-12 text-center">
    <h1
      class="m-0 max-w-[820px] text-[clamp(44px,7vw,84px)] font-bold leading-[1.02] tracking-[-2px]"
    >
      <span data-hero-word class="inline-block opacity-0">Your</span>
      <span data-hero-word class="inline-block opacity-0">controller.</span>
      <span
        data-hero-word
        class="inline-block bg-gradient-to-r from-[#8a8a92] via-white via-40% to-[#e8e8ec] bg-clip-text text-transparent opacity-0"
        >Chromed.</span
      >
    </h1>
    <p
      data-reveal="sub"
      class="m-0 mt-6 max-w-[520px] text-lg leading-[1.55] text-[rgba(242,242,244,0.62)] opacity-0"
    >
      A hand-finished chrome shell that snaps over your controller in seconds — mirror-polished,
      feather-light, zero compromise.
    </p>
    <ProductSpinner ref="spinner" class="mt-10 w-full" />
  </section>
</template>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/__tests__/HeroSection.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/HeroSection.vue src/components/__tests__/HeroSection.spec.ts
git commit -m "feat: add HeroSection component"
```

---

## Task 9: Feature content + `FeatureCard.vue`

**Files:**

- Create: `src/content/features.ts`
- Create: `src/components/FeatureCard.vue`
- Test: `src/components/__tests__/FeatureCard.spec.ts`

**Interfaces:**

- Produces: `Feature` interface and `FEATURES: Feature[]` (3 entries) from `features.ts`; a `<FeatureCard :feature :index />` component consumed by `App.vue` in Task 13.

- [ ] **Step 1: Create `src/content/features.ts`**

```ts
export interface Feature {
  tag: string
  title: string
  description: string
}

export const FEATURES: Feature[] = [
  {
    tag: 'FINISH',
    title: 'Show-floor chrome',
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
    title: 'On in one snap',
    description:
      'No tools, no glue, no warranty voided. Clicks on in seconds, pops off just as easily.',
  },
]
```

- [ ] **Step 2: Write the failing component test**

Create `src/components/__tests__/FeatureCard.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import FeatureCard from '../FeatureCard.vue'
import { FEATURES } from '@/content/features'

describe('FeatureCard', () => {
  it('renders the feature title, tag, and description', () => {
    const wrapper = mount(FeatureCard, { props: { feature: FEATURES[0], index: 0 } })
    expect(wrapper.text()).toContain(FEATURES[0].title)
    expect(wrapper.text()).toContain(FEATURES[0].tag)
    expect(wrapper.text()).toContain(FEATURES[0].description)
  })

  it('renders a zero-padded index number', () => {
    const wrapper = mount(FeatureCard, { props: { feature: FEATURES[1], index: 1 } })
    expect(wrapper.text()).toContain('02')
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run src/components/__tests__/FeatureCard.spec.ts`
Expected: FAIL with "Cannot find module '../FeatureCard.vue'".

- [ ] **Step 4: Create `src/components/FeatureCard.vue`**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { Feature } from '@/content/features'

const props = defineProps<{ feature: Feature; index: number }>()

const displayNumber = computed(() => String(props.index + 1).padStart(2, '0'))
</script>

<template>
  <div
    data-reveal="card"
    class="flex flex-col gap-4 rounded-[20px] border border-white/[0.08] bg-gradient-to-b from-white/[0.055] to-[#17171a] p-9 opacity-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_24px_48px_-20px_rgba(0,0,0,0.7)] transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_32px_64px_-20px_rgba(0,0,0,0.85)]"
  >
    <div class="flex items-baseline justify-between">
      <span class="font-mono text-xl text-[rgba(242,242,244,0.35)]">{{ displayNumber }}</span>
      <span class="font-mono text-base tracking-[2px] text-[rgba(242,242,244,0.35)]">{{
        feature.tag
      }}</span>
    </div>
    <div class="text-xl font-semibold tracking-[-0.3px]">{{ feature.title }}</div>
    <p class="m-0 text-[15px] leading-[1.6] text-[rgba(242,242,244,0.6)]">
      {{ feature.description }}
    </p>
  </div>
</template>
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/components/__tests__/FeatureCard.spec.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/content/features.ts src/components/FeatureCard.vue src/components/__tests__/FeatureCard.spec.ts
git commit -m "feat: add feature content and FeatureCard component"
```

---

## Task 10: `useScrollReveal` composable

**Files:**

- Create: `src/composables/useScrollReveal.ts`
- Test: `src/composables/__tests__/useScrollReveal.spec.ts`

**Interfaces:**

- Consumes: `animate` from `animejs`.
- Produces: `useScrollReveal(delayMs?: number): Ref<HTMLElement | null>` — a template ref to attach to any element; when it enters the viewport (or immediately, if `IntersectionObserver` is unavailable) it fades/slides in once. Consumed by `App.vue` in Task 13 for the features heading, and internally by `FeatureCard` usages there.

- [ ] **Step 1: Write the failing test**

Create `src/composables/__tests__/useScrollReveal.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { useScrollReveal } from '../useScrollReveal'

const TestComponent = defineComponent({
  setup() {
    const target = useScrollReveal()
    return () => h('div', { ref: target }, 'revealed content')
  },
})

describe('useScrollReveal', () => {
  it('reveals the element immediately when IntersectionObserver is unavailable (jsdom)', async () => {
    expect(typeof globalThis.IntersectionObserver).toBe('undefined')

    const wrapper = mount(TestComponent)
    await nextTick()
    const el = wrapper.get('div').element as HTMLElement
    expect(el.style.opacity).toBe('1')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/composables/__tests__/useScrollReveal.spec.ts`
Expected: FAIL with "Cannot find module '../useScrollReveal'".

- [ ] **Step 3: Create `src/composables/useScrollReveal.ts`**

```ts
import { animate } from 'animejs'
import { onMounted, onUnmounted, ref, type Ref } from 'vue'

const REVEAL_THRESHOLD = 0.25

function reveal(el: Element, delayMs: number) {
  animate(el, {
    opacity: [0, 1],
    translateY: [28, 0],
    duration: 800,
    ease: 'outCubic',
    delay: delayMs,
  })
}

/**
 * Returns a template ref: attach it to an element and it fades/slides in
 * once, the first time it scrolls into view (or immediately if
 * IntersectionObserver isn't available, e.g. in jsdom tests or very old
 * browsers — reveals must never be a hard requirement to see content).
 */
export function useScrollReveal(delayMs = 0): Ref<HTMLElement | null> {
  const target = ref<HTMLElement | null>(null)

  onMounted(() => {
    const el = target.value
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      el.style.opacity = '1'
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          observer.unobserve(entry.target)
          reveal(entry.target, delayMs)
        }
      },
      { threshold: REVEAL_THRESHOLD },
    )
    observer.observe(el)

    onUnmounted(() => observer.disconnect())
  })

  return target
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/composables/__tests__/useScrollReveal.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/composables/useScrollReveal.ts src/composables/__tests__/useScrollReveal.spec.ts
git commit -m "feat: add useScrollReveal composable"
```

---

## Task 11: `PreorderSection.vue`

**Files:**

- Create: `src/components/PreorderSection.vue`
- Test: `src/components/__tests__/PreorderSection.spec.ts`

**Interfaces:**

- Consumes: `animate` from `animejs`, `useScrollReveal` from Task 10.
- Produces: a `<PreorderSection />` component (no props), consumed by `App.vue` in Task 13.

- [ ] **Step 1: Write the failing component test**

Create `src/components/__tests__/PreorderSection.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PreorderSection from '../PreorderSection.vue'

describe('PreorderSection', () => {
  it('renders the run size, price, and fine print', () => {
    const wrapper = mount(PreorderSection)
    expect(wrapper.text()).toContain('300 units')
    expect(wrapper.text()).toContain('$38')
    expect(wrapper.text()).toContain('REFUNDABLE')
  })

  it('bounces the button on click without throwing', async () => {
    const wrapper = mount(PreorderSection)
    const button = wrapper.get('button')
    await expect(button.trigger('click')).resolves.not.toThrow()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/__tests__/PreorderSection.spec.ts`
Expected: FAIL with "Cannot find module '../PreorderSection.vue'".

- [ ] **Step 3: Create `src/components/PreorderSection.vue`**

```vue
<script setup lang="ts">
import { animate } from 'animejs'
import { useScrollReveal } from '@/composables/useScrollReveal'

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
  <section id="preorder" class="px-0 pb-40 pt-48 text-center">
    <div ref="revealTarget" class="opacity-0">
      <div class="mb-3.5 font-mono text-xl uppercase tracking-[4px] text-[rgba(242,242,244,0.4)]">
        [ FIRST DROP ]
      </div>
      <div class="text-[clamp(30px,5vw,52px)] font-bold leading-[1.1] tracking-[-1.5px]">
        300 units. One shot.
      </div>
      <p
        class="mx-auto mb-[34px] mt-[18px] max-w-[420px] text-[17px] leading-[1.55] text-[rgba(242,242,244,0.6)]"
      >
        Hand-finished in small batches and gone fast. Reserve now, ships worldwide this fall.
      </p>
      <button
        type="button"
        class="cursor-pointer rounded-full border border-white/90 bg-gradient-to-b from-white via-[#d8d8de] to-[#f0f0f4] px-12 py-[19px] text-[17px] font-semibold tracking-[0.2px] text-[#0c0c0e] shadow-[inset_0_1px_0_#fff,0_10px_30px_-8px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.03]"
        @click="onPreorder"
      >
        Reserve — $38
      </button>
      <div class="mt-3.5 font-mono text-[17px] tracking-wide text-[rgba(242,242,244,0.35)]">
        REFUNDABLE ANYTIME BEFORE SHIPPING
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/__tests__/PreorderSection.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/PreorderSection.vue src/components/__tests__/PreorderSection.spec.ts
git commit -m "feat: add PreorderSection component"
```

---

## Task 12: `AppFooter.vue`

**Files:**

- Create: `src/components/AppFooter.vue`
- Test: `src/components/__tests__/AppFooter.spec.ts`

**Interfaces:**

- Consumes: `src/assets/logo.png`.
- Produces: a `<AppFooter />` component (no props), consumed by `App.vue` in Task 13.

- [ ] **Step 1: Write the failing component test**

Create `src/components/__tests__/AppFooter.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AppFooter from '../AppFooter.vue'

describe('AppFooter', () => {
  it('renders the brand and copyright', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.text()).toContain('Customs')
    expect(wrapper.text()).toContain('© 2026')
  })

  it('renders the four social links', () => {
    const wrapper = mount(AppFooter)
    const linkText = wrapper.findAll('a').map((a) => a.text())
    expect(linkText).toEqual(['Instagram', 'TikTok', 'X', 'Discord'])
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/__tests__/AppFooter.spec.ts`
Expected: FAIL with "Cannot find module '../AppFooter.vue'".

- [ ] **Step 3: Create `src/components/AppFooter.vue`**

```vue
<script setup lang="ts">
import logo from '@/assets/logo.png'

const socialLinks = ['Instagram', 'TikTok', 'X', 'Discord']
</script>

<template>
  <footer
    class="flex flex-wrap items-center justify-between gap-5 border-t border-white/[0.08] px-0 pb-11 pt-9"
  >
    <div class="flex items-center gap-2.5">
      <img :src="logo" alt="" class="h-[22px] w-[22px] [image-rendering:pixelated] invert" />
      <span class="font-hand text-base text-[rgba(242,242,244,0.7)]">Customs</span>
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/__tests__/AppFooter.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/AppFooter.vue src/components/__tests__/AppFooter.spec.ts
git commit -m "feat: add AppFooter component"
```

---

## Task 13: `useIntroTimeline` composable

**Files:**

- Create: `src/composables/useIntroTimeline.ts`
- Test: `src/composables/__tests__/useIntroTimeline.spec.ts`

**Interfaces:**

- Consumes: `createTimeline`, `stagger` from `animejs`.
- Produces: `useIntroTimeline(onSpinIntro: () => void): { play(): void }` — `play()` builds and starts the mount-time entrance timeline (nav → hero words → subhead → spinner fade-in), then after the timeline's spinner step calls `onSpinIntro()`. Consumed by `App.vue` in Task 14.

- [ ] **Step 1: Write the failing test**

Create `src/composables/__tests__/useIntroTimeline.spec.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { useIntroTimeline } from '../useIntroTimeline'

const Fixture = defineComponent({
  props: { onSpinIntro: { type: Function, required: true } },
  setup(props) {
    const { play } = useIntroTimeline(props.onSpinIntro as () => void)
    return () =>
      h('div', [
        h('nav', { 'data-reveal': 'nav', style: { opacity: 0 } }),
        h('span', { 'data-hero-word': '', style: { opacity: 0 } }, 'Your'),
        h('p', { 'data-reveal': 'sub', style: { opacity: 0 } }),
        h('div', { 'data-spin-stage': '', style: { opacity: 0 } }),
        h('button', { onClick: () => play() }, 'play'),
      ])
  },
})

describe('useIntroTimeline', () => {
  it('runs without throwing against a matching DOM fixture', async () => {
    const onSpinIntro = vi.fn()
    const wrapper = mount(Fixture, { props: { onSpinIntro } })
    await expect(wrapper.get('button').trigger('click')).resolves.not.toThrow()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/composables/__tests__/useIntroTimeline.spec.ts`
Expected: FAIL with "Cannot find module '../useIntroTimeline'".

- [ ] **Step 3: Create `src/composables/useIntroTimeline.ts`**

```ts
import { createTimeline, stagger } from 'animejs'

/**
 * Builds and plays the once-per-load hero entrance: nav, then each hero
 * word staggered in, then the subhead, then the spinner fading/scaling in.
 * `onSpinIntro` is invoked ~900ms after play() starts, matching the original
 * design's one-full-rotation auto-spin once the spinner is visible.
 */
export function useIntroTimeline(onSpinIntro: () => void): { play: () => void } {
  function play() {
    createTimeline()
      .add('[data-reveal="nav"]', {
        opacity: [0, 1],
        translateY: [-16, 0],
        duration: 700,
        ease: 'outCubic',
      })
      .add(
        '[data-hero-word]',
        {
          opacity: [0, 1],
          translateY: [30, 0],
          rotate: [2, 0],
          delay: stagger(120),
          duration: 800,
          ease: 'outExpo',
        },
        '-=400',
      )
      .add(
        '[data-reveal="sub"]',
        { opacity: [0, 1], translateY: [16, 0], duration: 700, ease: 'outCubic' },
        '-=500',
      )
      .add(
        '[data-spin-stage]',
        { opacity: [0, 1], scale: [0.9, 1], duration: 900, ease: 'outExpo' },
        '-=450',
      )

    setTimeout(onSpinIntro, 900)
  }

  return { play }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/composables/__tests__/useIntroTimeline.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/composables/useIntroTimeline.ts src/composables/__tests__/useIntroTimeline.spec.ts
git commit -m "feat: add useIntroTimeline composable"
```

---

## Task 14: Compose `App.vue`, update its test, remove the old scaffold assertion

**Files:**

- Modify: `src/App.vue`
- Modify: `src/__tests__/App.spec.ts`

**Interfaces:**

- Consumes: `StarfieldBackground.vue` (Task 4), `AppNav.vue` (Task 7), `HeroSection.vue` (Task 8), `FeatureCard.vue` + `FEATURES` (Task 9), `useScrollReveal` (Task 10), `PreorderSection.vue` (Task 11), `AppFooter.vue` (Task 12), `useIntroTimeline` (Task 13).
- Produces: the fully composed page.

- [ ] **Step 1: Write the failing App test**

Replace `src/__tests__/App.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('renders every section of the landing page', () => {
    const wrapper = mount(App)
    const text = wrapper.text()
    expect(text).toContain('Customs')
    expect(text).toContain('Your controller.')
    expect(text).toContain('Built different')
    expect(text).toContain('300 units. One shot.')
    expect(text).toContain('© 2026')
  })

  it('renders exactly three feature cards', () => {
    const wrapper = mount(App)
    expect(wrapper.findAll('[data-reveal="card"]')).toHaveLength(3)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/__tests__/App.spec.ts`
Expected: FAIL — the current scaffold `App.vue` doesn't contain any of the new copy.

- [ ] **Step 3: Rewrite `src/App.vue`**

```vue
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/__tests__/App.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/App.vue src/__tests__/App.spec.ts
git commit -m "feat: compose the full landing page in App.vue"
```

---

## Task 15: Full verification pass

**Files:** none (verification only).

- [ ] **Step 1: Run the full test suite**

Run: `npm run test:unit`
Expected: all test files pass (starfield engine/prng, scroll composables, spinner, scroll-reveal, intro-timeline, and every component).

- [ ] **Step 2: Type-check**

Run: `npm run build`
Expected: `vue-tsc --build` and `vite build` both succeed with no errors.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: `oxlint` and `eslint` both complete with no unresolved errors (auto-fixable issues are fixed in place).

- [ ] **Step 4: Manual smoke check**

Run: `npm run dev`, open the printed local URL in a browser, and verify:

- The starfield background renders and parallaxes when scrolling/wheeling.
- The intro plays once on load (nav → headline words → subhead → spinner → one auto-rotation).
- Dragging the spinner rotates the controller image smoothly and releases with inertia.
- Scrolling reveals the features heading, the three cards (staggered), and the pre-order block.
- Clicking "Reserve — $38" plays the bounce animation.
- Stop the dev server (Ctrl+C) once confirmed.

- [ ] **Step 5: Commit (only if lint step 3 modified files)**

```bash
git add -A
git commit -m "chore: apply lint fixes"
```
