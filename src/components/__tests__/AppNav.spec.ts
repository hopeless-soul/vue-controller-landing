import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AppNav from '../AppNav.vue'

describe('AppNav', () => {
  it('renders the wordmark and a logo image', () => {
    const wrapper = mount(AppNav)
    expect(wrapper.text()).toContain('Luster')
    expect(wrapper.get('img').attributes('alt')).toContain('Luster')
  })

  it('links to the hero anchor', () => {
    const wrapper = mount(AppNav)
    expect(wrapper.get('a').attributes('href')).toBe('#top')
  })
})
