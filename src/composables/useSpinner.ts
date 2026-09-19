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
 * Fetches every frame into the browser's image cache so drag-driven `src`
 * swaps are instant. Without this, only the first frame is loaded up front;
 * every other frame is fetched lazily on first use, which is invisible on a
 * local dev server but stalls the drag over a real network (e.g. on Vercel).
 */
function preloadFrames(frames: string[]) {
  for (const src of frames) {
    const image = new Image()
    image.src = src
  }
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

  preloadFrames(frames)

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
