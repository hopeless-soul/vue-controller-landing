import { ref, type Ref } from 'vue'

export interface Projectile {
  id: number
  x: number
  launched: boolean
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
    const id = nextProjectileId++
    projectiles.value.push({ id, x: tankX.value + options.tankWidth / 2, launched: false })
    requestAnimationFrame(() => {
      const projectile = projectiles.value.find((p) => p.id === id)
      if (projectile) projectile.launched = true
    })
  }

  function removeProjectile(id: number) {
    projectiles.value = projectiles.value.filter((p) => p.id !== id)
  }

  return { trackRef, tankX, projectiles, onPointerMove, onPointerDown, removeProjectile }
}
