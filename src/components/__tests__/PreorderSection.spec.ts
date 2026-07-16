import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PreorderSection from '../PreorderSection.vue'

describe('PreorderSection', () => {
  it('renders the run size, price, and fine print', () => {
    const wrapper = mount(PreorderSection)
    expect(wrapper.text()).toContain('300 units')
    expect(wrapper.text()).toContain('$38')
    expect(wrapper.text()).toContain('REFUNDABLE')
  })

  it('bounces the button on click without throwing', async () => {
    const wrapper = mount(PreorderSection)
    const button = wrapper.get('button')
    await expect(button.trigger('click')).resolves.not.toThrow()
  })
})
