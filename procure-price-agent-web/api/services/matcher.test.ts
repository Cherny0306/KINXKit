import { describe, expect, it } from 'vitest'
import { buildRunItemResult } from './matcher'

describe('buildRunItemResult', () => {
  it('prefers catNo match and checks limit', () => {
    const r = buildRunItemResult({
      item: { rawName: 'X', catNo: 'ABC-1', limitPrice: 100 },
      candidates: [
        { siteId: 'mce', title: 't', url: 'u', priceText: '¥90', priceValue: 90, currency: 'CNY', matchedCatNo: 'ABC-1', confidence: 0.7 },
        { siteId: 'beyotime', title: 't2', url: 'u2', priceText: '¥80', priceValue: 80, currency: 'CNY', matchedCatNo: 'OTHER', confidence: 0.95 },
      ],
      evidences: [],
      warnings: [],
    })
    expect(r.recommended?.siteId).toBe('mce')
    expect(r.limitCheck?.withinLimit).toBe(true)
  })
})

