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
    tankX.value = clampToTrack(relativeX)
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
    window.addEventListener('pointermove', onWindowPointerMove)
    window.addEventListener('pointerdown', onWindowPointerDown)
  })

  onUnmounted(() => {
    window.removeEventListener('pointermove', onWindowPointerMove)
    window.removeEventListener('pointerdown', onWindowPointerDown)
    pendingTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId))
    pendingTimeouts.clear()
  })

  return { trackRef, tankX, projectiles, fire, removeProjectile }
}
