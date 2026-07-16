import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AppFooter from '../AppFooter.vue'

describe('AppFooter', () => {
  it('renders the brand and copyright', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.text()).toContain('Luster')
    expect(wrapper.text()).toContain('© 2026')
  })

  it('renders the four social links', () => {
    const wrapper = mount(AppFooter)
    const linkText = wrapper.findAll('a').map((a) => a.text())
    expect(linkText).toEqual(['Instagram', 'TikTok', 'X', 'Discord'])
  })
})
