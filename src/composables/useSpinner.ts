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
