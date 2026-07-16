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
