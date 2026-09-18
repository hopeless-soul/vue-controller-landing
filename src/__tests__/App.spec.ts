import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('renders every section of the landing page', () => {
    const wrapper = mount(App)
    const text = wrapper.text()
    expect(text).toContain('Customs')
    expect(text).toContain('Your controller')
    expect(text).toContain('Built different')
    expect(text).toContain('300 units. One shot.')
    expect(text).toContain('© 2026')
  })

  it('renders exactly three feature cards', () => {
    const wrapper = mount(App)
    expect(wrapper.findAll('[data-reveal="card"]')).toHaveLength(3)
  })
})
