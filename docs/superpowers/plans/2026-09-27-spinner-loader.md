# Spinner Reliability + Loading Stage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the hero product spinner draw only fully decoded frames and never fight between
drag and animation. Show a `0%`–`100%` loading counter in the `[ 360° INSPECT ]` badge until
the frames are ready.

**Architecture:**
- `loadFrames` fetches and decodes all 16 PNGs into `ImageBitmap`s and reports progress.
- `useSpinner` owns one frame value and at most one anime.js animation, and draws to a
  `<canvas>` from one rAF callback.
- `ProductSpinner.vue` owns the loading state, the badge/counter, and the reveal handoff (FLIP
  slide of the badge plus the stage fade-in plus the intro spin).
- `spinnerLog` prefixes all console output.

**Tech Stack:** Vue 3.5 (`<script setup>`, `useTemplateRef`), TypeScript, anime.js 4.5
(`animate`, `createTimeline`, `utils`, `JSAnimation`), Tailwind CSS 4, Vitest + jsdom.

Spec: `docs/superpowers/specs/2026-09-27-spinner-loader-design.md`

## Global Constraints

- Work directly on branch `figma-landing-rewrite`. No worktree.
- Tests kept minimal: no new unit tests. The existing `useSpinner.spec.ts` must pass unchanged.
  The only test edit is removing the `[data-spin-stage]` fixture node in
  `useIntroTimeline.spec.ts`.
- Frame size is 800×700 (canvas `width=800 height=700`). There are 16 frames (`FRAME_COUNT`).
- Badge look is unchanged: `bg-[#c5c5c5]`, `h-[64px] w-[500px] max-w-[90%]`, text `font-mono
  text-[15px] leading-7 uppercase tracking-[4px] text-black`, `font-variation-settings: 'BLED'
  0, 'SCAN' 0`.
- Badge final position is unchanged: `absolute bottom-0 left-1/2 -translate-x-1/2
  -translate-y-[112px]` inside a `relative w-full pt-[32px]` wrapper.
- Counter fill: base text black; white copy clipped with `clip-path: inset(${100 - p}% 0 0 0)`.
- Timings:
  - hold at 100 %: 250 ms;
  - badge slide: 700 ms `outExpo`;
  - stage reveal: `opacity [0,1]`, `scale [0.9,1]`, 900 ms `outExpo`;
  - minimum load display: 400 ms;
  - intro spin: +16 frames, 2600 ms `inOutCubic`;
  - inertia: `velocity * 14 * sensitivity` frames, `min(1400, 300 + |extra| * 90)` ms,
    `outQuart`.
- Console logging: prefix `[spinner] +<ms>ms <event>`; stays on in production.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/lib/spinnerLog.ts` | Create | Prefixed console logger (`info`/`warn`/`error`/`debug`) |
| `src/lib/loadFrames.ts` | Create | Fetch + decode frames to `ImageBitmap[]` with progress and retry-once |
| `src/composables/useSpinner.ts` | Rewrite | Frame state, single animation, pointer capture, canvas rAF drawing |
| `src/components/ProductSpinner.vue` | Rewrite | Loading state, badge/counter, handoff, failure fallback |
| `src/components/HeroSection.vue` | Modify | Drop badge markup + wrapper, keep `<ProductSpinner>` |
| `src/composables/useIntroTimeline.ts` | Modify | Remove `[data-spin-stage]` step |
| `src/composables/__tests__/useIntroTimeline.spec.ts` | Modify | Remove unused fixture node |

---

### Task 1: Logger and frame loader

**Files:**
- Create: `src/lib/spinnerLog.ts`
- Create: `src/lib/loadFrames.ts`

**Interfaces:**
- Produces:
  - `spinnerLog.info | warn | error | debug(event: string, detail?: Record<string, unknown>): void`
  - `loadFrames(urls: string[], onProgress: (done: number, total: number) => void): Promise<ImageBitmap[]>`

- [ ] **Step 1: Create the logger**

`src/lib/spinnerLog.ts`:

```ts
type Level = 'info' | 'warn' | 'error' | 'debug'

function emit(level: Level, event: string, detail?: Record<string, unknown>) {
  const message = `[spinner] +${Math.round(performance.now())}ms ${event}`
  if (detail === undefined) console[level](message)
  else console[level](message, detail)
}

/**
 * Console logging for the product spinner. Kept on in production builds so
 * load/interaction issues can be diagnosed on the deployed site. Stages log
 * at info, recoverable issues at warn, failures at error, and per-drag detail
 * at debug (only visible with DevTools' "Verbose" level).
 */
export const spinnerLog = {
  info: (event: string, detail?: Record<string, unknown>) => emit('info', event, detail),
  warn: (event: string, detail?: Record<string, unknown>) => emit('warn', event, detail),
  error: (event: string, detail?: Record<string, unknown>) => emit('error', event, detail),
  debug: (event: string, detail?: Record<string, unknown>) => emit('debug', event, detail),
}
```

- [ ] **Step 2: Create the frame loader**

`src/lib/loadFrames.ts`:

```ts
import { spinnerLog } from './spinnerLog'

async function loadOne(url: string): Promise<ImageBitmap> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return createImageBitmap(await response.blob())
}

/**
 * Downloads and fully decodes every frame up front, so drawing a frame later
 * never waits on the network or on a lazy decode. Each frame is retried once;
 * a second failure rejects. `onProgress` fires as each frame becomes drawable.
 * Resolves with bitmaps in the same order as `urls`.
 */
export async function loadFrames(
  urls: string[],
  onProgress: (done: number, total: number) => void,
): Promise<ImageBitmap[]> {
  const total = urls.length
  const startedAt = performance.now()
  let done = 0
  spinnerLog.info('load:start', { frames: total })

  const bitmaps = await Promise.all(
    urls.map(async (url, index) => {
      const frameStartedAt = performance.now()
      let bitmap: ImageBitmap
      try {
        bitmap = await loadOne(url)
      } catch (error) {
        spinnerLog.warn('load:retry', { index, url, error })
        try {
          bitmap = await loadOne(url)
        } catch (retryError) {
          spinnerLog.error('load:failed', { index, url, error: retryError })
          throw retryError
        }
      }
      done += 1
      spinnerLog.info('load:frame', {
        index,
        ms: Math.round(performance.now() - frameStartedAt),
        done,
        total,
      })
      onProgress(done, total)
      return bitmap
    }),
  )

  spinnerLog.info('load:done', { ms: Math.round(performance.now() - startedAt) })
  return bitmaps
}
```

- [ ] **Step 3: Type-check**

Run: `npm run type-check`
Expected: exits 0, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/spinnerLog.ts src/lib/loadFrames.ts
git commit -m "feat: add spinner logger and bitmap frame loader

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Canvas spinner, loader badge, handoff

This is one task because the `useSpinner` signature change and the `ProductSpinner` rewrite only
type-check together.

**Files:**
- Rewrite: `src/composables/useSpinner.ts`
- Rewrite: `src/components/ProductSpinner.vue`
- Modify: `src/components/HeroSection.vue` (the `<div class="relative w-full pt-[32px]">`
  block at the end of the template)
- Modify: `src/composables/useIntroTimeline.ts:3-8,26`
- Modify: `src/composables/__tests__/useIntroTimeline.spec.ts:15`

**Interfaces:**
- Consumes: `spinnerLog`, `loadFrames` (Task 1); `CONTROLLER_FRAMES` from
  `@/content/controllerFrames`.
- Produces:
  - `useSpinner(canvasRef: Ref<HTMLCanvasElement | null>, options?: UseSpinnerOptions): Spinner`
  - `Spinner = { onPointerDown(e: PointerEvent): void; setBitmaps(b: ImageBitmap[]): void; playIntroSpin(): void }`
  - `ProductSpinner` still exposes `playIntroSpin(): void`. It now means "request the intro".
  - `normalizeFrame`, `frameFromDrag`, `FRAME_COUNT`, `UseSpinnerOptions` are unchanged.

- [ ] **Step 1: Rewrite `src/composables/useSpinner.ts`**

```ts
import { animate, type JSAnimation } from 'animejs'
import { onScopeDispose, type Ref } from 'vue'
import { spinnerLog } from '@/lib/spinnerLog'

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
  /** Hands over the decoded frames; drawing and dragging are no-ops until then. */
  setBitmaps: (bitmaps: ImageBitmap[]) => void
  /** Plays one full auto-rotation from the current frame. */
  playIntroSpin: () => void
}

type AnimationKind = 'inertia' | 'intro'

/** Pointer velocity older than this (ms) at release counts as a stop, not a flick. */
const VELOCITY_STALE_MS = 100

/**
 * Drag-to-rotate logic for the product spinner, drawn to a canvas from
 * pre-decoded bitmaps. There is exactly one frame value and at most one
 * running animation: grabbing or starting a new animation cancels the old
 * one, so drag and animation never write frames at the same time. Input only
 * updates `frame`; a single rAF callback draws, skipping repeat frames.
 */
export function useSpinner(
  canvasRef: Ref<HTMLCanvasElement | null>,
  options: UseSpinnerOptions = {},
): Spinner {
  const sensitivity = options.sensitivity ?? 1
  let bitmaps: ImageBitmap[] = []
  let frame = 0
  let lastDrawnIndex = -1
  let rafId = 0
  let dragging = false
  let active: { kind: AnimationKind; animation: JSAnimation } | null = null

  function draw() {
    rafId = 0
    const canvas = canvasRef.value
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    const index = normalizeFrame(frame, FRAME_COUNT)
    if (index === lastDrawnIndex) return
    const bitmap = bitmaps[index]
    if (!bitmap) {
      spinnerLog.warn('draw:skipped', { index })
      return
    }
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    lastDrawnIndex = index
  }

  function setFrame(value: number) {
    frame = value
    if (bitmaps.length > 0 && rafId === 0) rafId = requestAnimationFrame(draw)
  }

  function stopAnimation() {
    if (!active) return
    spinnerLog.warn('animation:interrupted', {
      animation: active.kind,
      frame: Math.round(frame * 100) / 100,
    })
    active.animation.cancel()
    active = null
  }

  function animateFrames(
    kind: AnimationKind,
    to: number,
    duration: number,
    ease: string,
    onDone?: () => void,
  ) {
    stopAnimation()
    const proxy = { frame }
    const animation = animate(proxy, {
      frame: to,
      duration,
      ease,
      onUpdate: () => setFrame(proxy.frame),
      onComplete: () => {
        if (active?.animation === animation) active = null
        onDone?.()
      },
    })
    active = { kind, animation }
  }

  function onPointerDown(event: PointerEvent) {
    if (bitmaps.length === 0) {
      spinnerLog.warn('drag:ignored', { reason: 'not-ready' })
      return
    }
    if (event.button !== 0) {
      spinnerLog.warn('drag:ignored', { reason: 'non-primary-button', button: event.button })
      return
    }
    if (dragging) {
      spinnerLog.warn('drag:ignored', { reason: 'already-dragging' })
      return
    }
    event.preventDefault()
    stopAnimation()

    const stage = event.currentTarget as HTMLElement
    const { pointerId } = event
    stage.setPointerCapture(pointerId)
    stage.style.cursor = 'grabbing'
    dragging = true

    const startX = event.clientX
    const startFrame = frame
    let lastX = event.clientX
    let lastT = performance.now()
    let velocity = 0
    spinnerLog.debug('drag:start', { pointerId, startFrame })

    const onMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return
      const now = performance.now()
      velocity = (moveEvent.clientX - lastX) / Math.max(now - lastT, 1)
      lastX = moveEvent.clientX
      lastT = now
      setFrame(frameFromDrag(startFrame, moveEvent.clientX - startX, sensitivity))
    }

    const end = (endEvent: PointerEvent) => {
      if (endEvent.pointerId !== pointerId) return
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerup', end)
      stage.removeEventListener('pointercancel', end)
      stage.removeEventListener('lostpointercapture', end)
      if (stage.hasPointerCapture(pointerId)) stage.releasePointerCapture(pointerId)
      stage.style.cursor = ''
      dragging = false

      if (performance.now() - lastT > VELOCITY_STALE_MS) velocity = 0
      // Inertia: convert px/ms velocity into extra frames, ease out. Only a real
      // release flicks; a cancelled or lost pointer just stops where it is.
      const extra = endEvent.type === 'pointerup' ? velocity * 14 * sensitivity : 0
      spinnerLog.debug('drag:end', { reason: endEvent.type, velocity, inertiaFrames: extra })
      if (Math.abs(extra) > 0.5) {
        spinnerLog.debug('inertia:start', { from: frame, to: frame + extra })
        animateFrames('inertia', frame + extra, Math.min(1400, 300 + Math.abs(extra) * 90), 'outQuart')
      }
    }

    stage.addEventListener('pointermove', onMove)
    stage.addEventListener('pointerup', end)
    stage.addEventListener('pointercancel', end)
    stage.addEventListener('lostpointercapture', end)
  }

  function setBitmaps(next: ImageBitmap[]) {
    bitmaps = next
    lastDrawnIndex = -1
    setFrame(frame)
  }

  function playIntroSpin() {
    if (bitmaps.length === 0) return
    spinnerLog.info('intro-spin:start')
    animateFrames('intro', frame + FRAME_COUNT, 2600, 'inOutCubic', () =>
      spinnerLog.info('intro-spin:done'),
    )
  }

  onScopeDispose(() => {
    active?.animation.cancel()
    active = null
    if (rafId !== 0) cancelAnimationFrame(rafId)
  })

  return { onPointerDown, setBitmaps, playIntroSpin }
}
```

Note: `drag:ignored` gains an extra reason, `already-dragging`, which the spec doesn't list. It
blocks a second touch from starting a competing drag, which would bring back the frame fight.

- [ ] **Step 2: Rewrite `src/components/ProductSpinner.vue`**

```vue
<script setup lang="ts">
import { nextTick, onMounted, ref, useTemplateRef } from 'vue'
import { animate, createTimeline, utils, type JSAnimation } from 'animejs'
import { useSpinner } from '@/composables/useSpinner'
import { CONTROLLER_FRAMES } from '@/content/controllerFrames'
import { loadFrames } from '@/lib/loadFrames'
import { spinnerLog } from '@/lib/spinnerLog'

const ALT = 'Customs chrome controller shell, rotating product view'
const HOLD_MS = 250
const MIN_LOAD_MS = 400
const STEP_TWEEN_MS = 350

const stageRef = useTemplateRef<HTMLElement>('stage')
const canvasRef = useTemplateRef<HTMLCanvasElement>('canvas')
const badgeRef = useTemplateRef<HTMLElement>('badge')
const counterRef = useTemplateRef<HTMLElement>('counter')
const labelRef = useTemplateRef<HTMLElement>('label')

const spinner = useSpinner(canvasRef)

const state = ref<'loading' | 'ready' | 'failed'>('loading')
/** Badge sits at its final (below-centre) spot once the reveal starts. */
const badgeSettled = ref(false)
/** Tweened 0–100 value driving both the counter text and its white fill. */
const displayed = ref(0)

const counterProxy = { value: 0 }
let counterTween: JSAnimation | null = null
let introRequested = false
let revealed = false

/** Tweens the counter toward `target`; resolves only if this tween finishes. */
function tweenCounter(target: number, duration: number): Promise<void> {
  counterTween?.cancel()
  return new Promise((resolve) => {
    counterTween = animate(counterProxy, {
      value: target,
      duration,
      ease: 'outCubic',
      onUpdate: () => {
        displayed.value = counterProxy.value
      },
      onComplete: () => resolve(),
    })
  })
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Badge text crossfade + stage fade/scale-in + intro spin, shared by both outcomes. */
function revealTimeline() {
  return createTimeline()
    .add(counterRef.value!, { opacity: 0, duration: 250, ease: 'outQuad' }, 0)
    .add(labelRef.value!, { opacity: [0, 1], duration: 400, ease: 'outQuad' }, 200)
    .add(stageRef.value!, { opacity: [0, 1], scale: [0.9, 1], duration: 900, ease: 'outExpo' }, 0)
    .call(() => spinner.playIntroSpin(), 0)
}

async function handoff() {
  spinnerLog.info('handoff:start')
  await wait(HOLD_MS)
  // FLIP: measure centred badge, switch to final position, animate the difference away.
  const badge = badgeRef.value!
  const first = badge.getBoundingClientRect().top
  badgeSettled.value = true
  await nextTick()
  const offset = first - badge.getBoundingClientRect().top
  utils.set(badge, { translateY: offset })
  revealTimeline()
    .add(badge, { translateY: [offset, 0], duration: 700, ease: 'outExpo' }, 0)
    .then(() => spinnerLog.info('handoff:done'))
}

function revealFallback() {
  spinnerLog.error('fallback:static-image')
  badgeSettled.value = true
  revealTimeline()
}

/** Reveals once both the page intro has asked for it and loading has settled. */
function maybeReveal() {
  if (revealed || !introRequested || state.value === 'loading') return
  revealed = true
  if (state.value === 'ready') void handoff()
  else revealFallback()
}

function playIntroSpin() {
  spinnerLog.info('intro:requested')
  introRequested = true
  maybeReveal()
}

onMounted(async () => {
  const startedAt = performance.now()
  try {
    if (!canvasRef.value?.getContext('2d')) {
      spinnerLog.error('canvas:no-context')
      throw new Error('canvas 2d context unavailable')
    }
    const bitmaps = await loadFrames(CONTROLLER_FRAMES, (done, total) => {
      if (done < total) void tweenCounter((done / total) * 100, STEP_TWEEN_MS)
    })
    await tweenCounter(100, Math.max(STEP_TWEEN_MS, MIN_LOAD_MS - (performance.now() - startedAt)))
    spinner.setBitmaps(bitmaps)
    state.value = 'ready'
  } catch {
    counterTween?.cancel()
    state.value = 'failed'
  }
  maybeReveal()
})

defineExpose({ playIntroSpin })
</script>

<template>
  <div class="relative w-full pt-[32px]">
    <div
      ref="stage"
      data-spin-stage
      class="mx-auto flex aspect-square w-full max-w-[720px] cursor-grab touch-none select-none items-center justify-center opacity-0"
      @pointerdown="spinner.onPointerDown"
    >
      <img
        v-if="state === 'failed'"
        :src="CONTROLLER_FRAMES[0]"
        :alt="ALT"
        draggable="false"
        class="pointer-events-none w-full"
      />
      <canvas
        v-else
        ref="canvas"
        width="800"
        height="700"
        role="img"
        :aria-label="ALT"
        :aria-hidden="state !== 'ready'"
        class="pointer-events-none w-full"
      />
    </div>
    <div
      ref="badge"
      class="absolute left-1/2 z-10 grid h-[64px] w-[500px] max-w-[90%] -translate-x-1/2 place-items-center bg-[#c5c5c5]"
      :class="
        badgeSettled ? 'bottom-0 -translate-y-[112px]' : 'top-[calc(50%+16px)] -translate-y-1/2'
      "
      :role="state === 'loading' ? 'progressbar' : undefined"
      :aria-valuemin="state === 'loading' ? 0 : undefined"
      :aria-valuemax="state === 'loading' ? 100 : undefined"
      :aria-valuenow="state === 'loading' ? Math.round(displayed) : undefined"
      style="font-variation-settings: 'BLED' 0, 'SCAN' 0"
    >
      <span
        ref="counter"
        class="col-start-1 row-start-1 grid font-mono text-[15px] leading-7 uppercase tracking-[4px]"
        aria-hidden="true"
      >
        <span class="col-start-1 row-start-1 text-black">{{ Math.round(displayed) }}%</span>
        <span
          class="col-start-1 row-start-1 text-white"
          :style="{ clipPath: `inset(${100 - displayed}% 0 0 0)` }"
          >{{ Math.round(displayed) }}%</span
        >
      </span>
      <span
        ref="label"
        class="col-start-1 row-start-1 font-mono text-[15px] leading-7 uppercase tracking-[4px] text-black opacity-0"
      >
        [ 360° INSPECT ]
      </span>
    </div>
  </div>
</template>
```

Notes for the implementer:
- `top-[calc(50%+16px)]` puts the badge at the stage centre: the wrapper is `32px` padding plus
  the stage height, so the stage centre is at `50% + 16px`.
- Tailwind 4 translate utilities use the CSS `translate` property. anime's `translateY` writes
  `transform`, so the FLIP offset stacks on top of the Tailwind classes without clobbering them.
- The badge class switch and `utils.set` both run before the next paint, so the badge doesn't
  flash at its final position.

- [ ] **Step 3: Simplify `src/components/HeroSection.vue`**

Replace the final block of the template:

```vue
    <div class="relative w-full pt-[32px]">
      <div
        class="absolute bottom-0 left-1/2 -translate-x-1/2 -translate-y-[112px] flex h-[64px] w-[500px] max-w-[90%] items-center justify-center bg-[#c5c5c5]"
      >
        <span
          class="font-mono text-[15px] leading-7 uppercase tracking-[4px] text-black"
          style="
            font-variation-settings:
              'BLED' 0,
              'SCAN' 0;
          "
        >
          [ 360° INSPECT ]
        </span>
      </div>
      <ProductSpinner ref="spinner" class="w-full" />
    </div>
```

with:

```vue
    <ProductSpinner ref="spinner" class="w-full" />
```

- [ ] **Step 4: Drop the stage step from `src/composables/useIntroTimeline.ts`**

Replace the doc comment and remove the `[data-spin-stage]` line so the file reads:

```ts
import { createTimeline, stagger } from 'animejs'

/**
 * Builds and plays the once-per-load hero entrance: nav, then each hero
 * word staggered in, then the subhead. `onSpinIntro` is invoked ~900ms after
 * play() starts to request the spinner reveal; the spinner itself waits
 * until its frames are loaded before revealing and spinning.
 */
export function useIntroTimeline(onSpinIntro: () => void): { play: () => void } {
  function play() {
    createTimeline()
      .add('[data-reveal="nav"]', { opacity: [0, 1], translateY: [-16, 0], duration: 700, ease: 'outCubic' })
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
      .add('[data-reveal="sub"]', { opacity: [0, 1], translateY: [16, 0], duration: 700, ease: 'outCubic' }, '-=500')

    setTimeout(onSpinIntro, 900)
  }

  return { play }
}
```

- [ ] **Step 5: Remove the unused fixture node**

In `src/composables/__tests__/useIntroTimeline.spec.ts`, delete this line:

```ts
        h('div', { 'data-spin-stage': '', style: { opacity: 0 } }),
```

- [ ] **Step 6: Type-check, lint, test**

Run: `npm run type-check`
Expected: exits 0.

Run: `npm run lint`
Expected: exits 0 (it auto-fixes formatting; review any diff it makes).

Run: `npx vitest run`
Expected: all tests pass (`useSpinner.spec.ts` and `useIntroTimeline.spec.ts` included).

- [ ] **Step 7: Commit**

```bash
git add src/composables/useSpinner.ts src/components/ProductSpinner.vue src/components/HeroSection.vue src/composables/useIntroTimeline.ts src/composables/__tests__/useIntroTimeline.spec.ts
git commit -m "fix: draw spinner from decoded bitmaps with loading counter badge

Cancel running animations on grab, capture the pointer and tear down on
up/cancel/lost-capture, and render pre-decoded ImageBitmaps to a canvas
from a single rAF. The [ 360° INSPECT ] badge shows a 0-100% counter
centred on the stage while frames load, then slides to its place as the
spinner reveals.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Manual verification in the browser

**Files:** none (fix-ups, if any, go in a follow-up commit).

- [ ] **Step 1: Start the dev server**

Run: `npm run dev` (in the background) and open the printed URL (usually
`http://localhost:5173`).

- [ ] **Step 2: Cold load**

In DevTools, set Network to "Fast 3G", tick "Disable cache", set Console level to include
Verbose, then reload. Check:
- the badge sits centred on the empty stage;
- `0%` → `100%` counts smoothly;
- white fills the digits bottom → top;
- the badge holds, slides down to its old spot, and the text crossfades to `[ 360° INSPECT ]`;
- the controller fades and scales in and does one full spin;
- the console shows, in order: `load:start`, 16 × `load:frame`, `load:done`, `intro:requested`
  (possibly earlier), `handoff:start`, `intro-spin:start`, `handoff:done`, `intro-spin:done`.

- [ ] **Step 3: Interaction**

Throttling off.
- Grab during the intro spin: no jump, and `animation:interrupted {animation: 'intro'}` is
  logged.
- Flick hard, then grab mid-inertia, repeated about 10 times: no jumps, no blank or half-drawn
  frames, and `animation:interrupted {animation: 'inertia'}` is logged.
- Right-click the stage: no drag, `drag:ignored {reason: 'non-primary-button'}`.
- Drag, release outside the browser window: the drag ends (`drag:end` logged) and the spinner
  does not keep following the mouse.

- [ ] **Step 4: Warm cache and failure**

- Untick "Disable cache" and reload. The counter still runs for at least about 400 ms and does
  not flash.
- In the Network panel, block the request URL pattern `*0005*`, then reload. You should see:
  - `load:retry` then `load:failed` then `fallback:static-image`;
  - the badge goes to its final spot showing `[ 360° INSPECT ]`;
  - a static controller image fades in;
  - dragging logs `drag:ignored {reason: 'not-ready'}`.
- Remove the block afterwards.
