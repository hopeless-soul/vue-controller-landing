import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductSpinner from '../ProductSpinner.vue'
import { CONTROLLER_FRAMES } from '@/content/controllerFrames'

describe('ProductSpinner', () => {
  it('renders 16 controller frames and starts on the first one', () => {
    expect(CONTROLLER_FRAMES).toHaveLength(16)

    const wrapper = mount(ProductSpinner)
    const img = wrapper.get('img')
    expect(img.attributes('src')).toBe(CONTROLLER_FRAMES[0])
  })

  it('exposes playIntroSpin', () => {
    const wrapper = mount(ProductSpinner)
    expect(typeof wrapper.vm.playIntroSpin).toBe('function')
    expect(() => wrapper.vm.playIntroSpin()).not.toThrow()
  })
})
