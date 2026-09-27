import { createTimeline, stagger } from 'animejs'

/**
 * Builds and plays the once-per-load hero entrance: nav, then each hero
 * word staggered in, then the subhead. `onSpinIntro` is invoked ~900ms after
 * play() starts to request the spinner reveal; the spinner itself waits
 * until its frames are loaded before revealing and spinning.
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

    setTimeout(onSpinIntro, 900)
  }

  return { play }
}
