import { describe, expect, it } from 'vitest'
import { FRAME_COUNT, frameFromDrag, normalizeFrame } from '../useSpinner'

describe('normalizeFrame', () => {
  it('wraps positive overflow into [0, total)', () => {
    expect(normalizeFrame(16, 16)).toBe(0)
    expect(normalizeFrame(17, 16)).toBe(1)
    expect(normalizeFrame(32, 16)).toBe(0)
  })

  it('wraps negative values into [0, total)', () => {
    expect(normalizeFrame(-1, 16)).toBe(15)
    expect(normalizeFrame(-17, 16)).toBe(15)
  })

  it('rounds fractional frames before wrapping', () => {
    expect(normalizeFrame(3.6, 16)).toBe(4)
    expect(normalizeFrame(-0.6, 16)).toBe(15)
  })

  it('defaults total to FRAME_COUNT (16)', () => {
    expect(normalizeFrame(16)).toBe(0)
    expect(FRAME_COUNT).toBe(16)
  })
})

describe('frameFromDrag', () => {
  it('returns the start frame when drag distance is zero', () => {
    expect(frameFromDrag(5, 0, 1)).toBe(5)
  })

  it('advances one frame per 28px of drag at sensitivity 1', () => {
    expect(frameFromDrag(0, 28, 1)).toBeCloseTo(1, 10)
    expect(frameFromDrag(0, -28, 1)).toBeCloseTo(-1, 10)
  })

  it('scales the drag-to-frame ratio by sensitivity', () => {
    expect(frameFromDrag(0, 28, 2)).toBeCloseTo(2, 10)
    expect(frameFromDrag(0, 14, 2)).toBeCloseTo(1, 10)
  })

  it('adds the delta on top of a non-zero start frame', () => {
    expect(frameFromDrag(10, 56, 1)).toBeCloseTo(12, 10)
  })
})
