import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
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
})
