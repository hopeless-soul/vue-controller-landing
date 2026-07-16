const frameModules = import.meta.glob<{ default: string }>('@/assets/controller-render/*.png', {
  eager: true,
})

/** The 16 spinner frames, sorted ascending by filename (0001.png .. 0016.png). */
export const CONTROLLER_FRAMES: string[] = Object.keys(frameModules)
  .sort()
  .map((key) => frameModules[key]!.default)
