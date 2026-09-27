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
