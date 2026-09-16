import { calculateSellPrice } from './priceCalculator'

describe('calculateSellPrice', () => {
  it('applies the discount percentage and rounds to the nearest integer', () => {
    expect(calculateSellPrice({ originalPrice: 100000, discountPercent: 10 })).toBe(90000)
    expect(calculateSellPrice({ originalPrice: 9999, discountPercent: 15 })).toBe(8499)
  })

  it('returns the original price when there is no discount', () => {
    expect(calculateSellPrice({ originalPrice: 50000, discountPercent: 0 })).toBe(50000)
  })

  it('clamps discounts above 100 to 100 percent', () => {
    expect(calculateSellPrice({ originalPrice: 50000, discountPercent: 150 })).toBe(0)
  })

  it('clamps negative discounts to 0 percent', () => {
    expect(calculateSellPrice({ originalPrice: 50000, discountPercent: -20 })).toBe(50000)
  })

  it('returns 0 when originalPrice is not a number', () => {
    expect(calculateSellPrice({ originalPrice: NaN, discountPercent: 10 })).toBe(0)
  })

  it('returns 0 when discountPercent is not a number', () => {
    expect(calculateSellPrice({ originalPrice: 10000, discountPercent: NaN })).toBe(0)
  })
})
