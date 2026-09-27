import { onMounted, onUnmounted, ref, type Ref } from 'vue'

export interface Projectile {
  id: number
  x: number
  launched: boolean
}

interface UseTankControlsOptions {
  tankWidth: number
  /** Whether the tank section is currently in the viewport — gates both tracking and firing. */
  isActive: () => boolean
  /** How long a projectile stays alive before it's removed, in ms. */
  projectileTravelMs: number
}

/** Time constant of the exponential ease toward the pointer — lower is snappier. */
const FOLLOW_TIME_CONSTANT_MS = 10
/** Distance (px) at which the tank snaps onto its target and the follow loop stops. */
const FOLLOW_SNAP_DISTANCE = 0.5

let nextProjectileId = 0

export function useTankControls(options: UseTankControlsOptions): {
  trackRef: Ref<HTMLElement | null>
  tankX: Ref<number>
  projectiles: Ref<Projectile[]>
  fire: () => void
  removeProjectile: (id: number) => void
} {
  const trackRef = ref<HTMLElement | null>(null)
  const tankX = ref(0)
  const projectiles = ref<Projectile[]>([])
  const pendingTimeouts = new Set<number>()
  let targetX = 0
  let followRafId: number | null = null
  let lastFrameTime = 0
  let prefersReducedMotion = false

  function clampToTrack(x: number): number {
    const track = trackRef.value
    if (!track) return x
    const maxX = Math.max(0, track.clientWidth - options.tankWidth)
    return Math.min(Math.max(x, 0), maxX)
  }

  function onWindowPointerMove(event: PointerEvent) {
    if (!options.isActive()) return
    const track = trackRef.value
    if (!track) return
    const rect = track.getBoundingClientRect()
    const relativeX = event.clientX - rect.left - options.tankWidth / 2
    targetX = clampToTrack(relativeX)
    if (prefersReducedMotion) {
      tankX.value = targetX
      return
    }
    startFollowing()
  }

  function startFollowing() {
    if (followRafId !== null) return
    lastFrameTime = performance.now()
    followRafId = requestAnimationFrame(followStep)
  }

  // Frame-rate independent exponential ease-out toward targetX.
  function followStep(now: number) {
    const dt = now - lastFrameTime
    lastFrameTime = now
    const alpha = 1 - Math.exp(-dt / FOLLOW_TIME_CONSTANT_MS)
    tankX.value += (targetX - tankX.value) * alpha
    if (Math.abs(targetX - tankX.value) < FOLLOW_SNAP_DISTANCE) {
      tankX.value = targetX
      followRafId = null
      return
    }
    followRafId = requestAnimationFrame(followStep)
  }

  function fire() {
    if (!options.isActive()) return
    const id = nextProjectileId++
    projectiles.value.push({ id, x: tankX.value + options.tankWidth / 2, launched: false })
    requestAnimationFrame(() => {
      const projectile = projectiles.value.find((p) => p.id === id)
      if (projectile) projectile.launched = true
    })
    const timeoutId = window.setTimeout(() => {
      pendingTimeouts.delete(timeoutId)
      removeProjectile(id)
    }, options.projectileTravelMs)
    pendingTimeouts.add(timeoutId)
  }

  function onWindowPointerDown(event: PointerEvent) {
    if (event.button !== 0) return
    fire()
  }

  function removeProjectile(id: number) {
    projectiles.value = projectiles.value.filter((p) => p.id !== id)
  }

  onMounted(() => {
    prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    window.addEventListener('pointermove', onWindowPointerMove)
    window.addEventListener('pointerdown', onWindowPointerDown)
  })

  onUnmounted(() => {
    window.removeEventListener('pointermove', onWindowPointerMove)
    window.removeEventListener('pointerdown', onWindowPointerDown)
    if (followRafId !== null) cancelAnimationFrame(followRafId)
    followRafId = null
    pendingTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId))
    pendingTimeouts.clear()
  })

  return { trackRef, tankX, projectiles, fire, removeProjectile }
}
