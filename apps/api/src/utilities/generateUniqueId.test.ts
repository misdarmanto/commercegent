import { generateUniqueId } from './generateUniqueId'

describe('generateUniqueId', () => {
  it('defaults to a length of 2', () => {
    expect(generateUniqueId()).toHaveLength(2)
  })

  it('generates an id of the requested length', () => {
    expect(generateUniqueId(8)).toHaveLength(8)
  })

  it('only uses uppercase letters and digits', () => {
    const id = generateUniqueId(50)
    expect(id).toMatch(/^[A-Z0-9]+$/)
  })

  it('returns an empty string for a length of 0', () => {
    expect(generateUniqueId(0)).toBe('')
  })

  it('is not deterministic across calls', () => {
    const ids = new Set(Array.from({ length: 20 }, () => generateUniqueId(12)))
    expect(ids.size).toBeGreaterThan(1)
  })
})
