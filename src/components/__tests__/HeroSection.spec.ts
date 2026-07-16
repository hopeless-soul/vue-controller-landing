import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import HeroSection from '../HeroSection.vue'

describe('HeroSection', () => {
  it('renders the headline and subhead', () => {
    const wrapper = mount(HeroSection)
    expect(wrapper.text()).toContain('Your controller.')
    expect(wrapper.text()).toContain('Reflected.')
    expect(wrapper.text()).toContain('mirror-polished')
  })

  it('renders the product spinner', () => {
    const wrapper = mount(HeroSection)
    expect(wrapper.find('img[alt*="Luster"]').exists()).toBe(true)
  })

  it('forwards playIntroSpin to the spinner', () => {
    const wrapper = mount(HeroSection)
    expect(typeof wrapper.vm.playIntroSpin).toBe('function')
    expect(() => wrapper.vm.playIntroSpin()).not.toThrow()
  })
})
