import { createTimeline, stagger } from 'animejs'

/**
 * Builds and plays the once-per-load hero entrance: nav, then each hero
 * word staggered in, then the subhead, then the spinner fading/scaling in.
 * `onSpinIntro` is invoked ~900ms after play() starts, matching the original
 * design's one-full-rotation auto-spin once the spinner is visible.
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
      .add('[data-spin-stage]', { opacity: [0, 1], scale: [0.9, 1], duration: 900, ease: 'outExpo' }, '-=450')

    setTimeout(onSpinIntro, 900)
  }

  return { play }
}
