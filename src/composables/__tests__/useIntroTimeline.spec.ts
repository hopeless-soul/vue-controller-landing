import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { useIntroTimeline } from '../useIntroTimeline'

const Fixture = defineComponent({
  props: { onSpinIntro: { type: Function, required: true } },
  setup(props) {
    const { play } = useIntroTimeline(props.onSpinIntro as () => void)
    return () =>
      h('div', [
        h('nav', { 'data-reveal': 'nav', style: { opacity: 0 } }),
        h('span', { 'data-hero-word': '', style: { opacity: 0 } }, 'Your'),
        h('p', { 'data-reveal': 'sub', style: { opacity: 0 } }),
        h('div', { 'data-spin-stage': '', style: { opacity: 0 } }),
        h('button', { onClick: () => play() }, 'play'),
      ])
  },
})

describe('useIntroTimeline', () => {
  it('runs without throwing against a matching DOM fixture', async () => {
    const onSpinIntro = vi.fn()
    const wrapper = mount(Fixture, { props: { onSpinIntro } })
    await expect(wrapper.get('button').trigger('click')).resolves.not.toThrow()
  })
})
