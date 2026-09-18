import { onMounted, onUnmounted, ref, type Ref } from 'vue'

/**
 * Tracks whether the returned target element currently intersects the
 * viewport. Unlike useScrollReveal, this keeps updating on both enter and
 * exit — used to gate interactions (e.g. only allow firing) to when a
 * section is actually visible.
 */
export function useInViewport(): { target: Ref<HTMLElement | null>; isInViewport: Ref<boolean> } {
  const target = ref<HTMLElement | null>(null)
  const isInViewport = ref(false)

  onMounted(() => {
    const el = target.value
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      isInViewport.value = true
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isInViewport.value = entry.isIntersecting
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(el)

    onUnmounted(() => observer.disconnect())
  })

  return { target, isInViewport }
}
