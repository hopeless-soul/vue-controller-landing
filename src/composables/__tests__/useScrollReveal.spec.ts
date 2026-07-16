import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { useScrollReveal } from '../useScrollReveal'

const TestComponent = defineComponent({
  setup() {
    const target = useScrollReveal()
    return () => h('div', { ref: target }, 'revealed content')
  },
})

describe('useScrollReveal', () => {
  it('reveals the element immediately when IntersectionObserver is unavailable (jsdom)', async () => {
    expect(typeof globalThis.IntersectionObserver).toBe('undefined')

    const wrapper = mount(TestComponent)
    await nextTick()
    const el = wrapper.get('div').element as HTMLElement
    expect(el.style.opacity).toBe('1')
  })
})
