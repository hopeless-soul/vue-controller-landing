import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import FeatureCard from '../FeatureCard.vue'
import { FEATURES } from '@/content/features'

describe('FeatureCard', () => {
  it('renders the feature title, tag, and description', () => {
    const wrapper = mount(FeatureCard, { props: { feature: FEATURES[0]!, index: 0 } })
    expect(wrapper.text()).toContain(FEATURES[0]!.title)
    expect(wrapper.text()).toContain(FEATURES[0]!.tag)
    expect(wrapper.text()).toContain(FEATURES[0]!.description)
  })

  it('renders a zero-padded index number', () => {
    const wrapper = mount(FeatureCard, { props: { feature: FEATURES[1]!, index: 1 } })
    expect(wrapper.text()).toContain('02')
  })

  it('reveals the card (opacity: 1) after mount via useScrollReveal', async () => {
    const wrapper = mount(FeatureCard, { props: { feature: FEATURES[0]!, index: 0 } })
    await nextTick()
    const el = wrapper.get('[data-reveal="card"]').element as HTMLElement
    expect(el.style.opacity).toBe('1')
  })
})
