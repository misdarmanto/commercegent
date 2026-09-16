import { Pagination } from './pagination'

describe('Pagination', () => {
  it('defaults to a limit of 10 when no size is given', () => {
    const pagination = new Pagination(1)
    expect(pagination.limit).toBe(10)
  })

  it('calculates the offset for the first page as 0', () => {
    const pagination = new Pagination(1, 20)
    expect(pagination.offset).toBe(0)
  })

  it('calculates the offset for subsequent pages', () => {
    const pagination = new Pagination(3, 20)
    expect(pagination.offset).toBe(40)
  })

  it('clamps page numbers below 1 up to page 1', () => {
    const pagination = new Pagination(0)
    expect(pagination.page).toBe(1)
    expect(pagination.offset).toBe(0)
  })

  it('clamps a negative page to page 1', () => {
    const pagination = new Pagination(-5)
    expect(pagination.page).toBe(1)
  })

  it('falls back to a limit of 10 for a non-numeric size', () => {
    const pagination = new Pagination(1, NaN)
    expect(pagination.limit).toBe(10)
  })

  it('formats data with totalPages, currentPage, items and totalItems', () => {
    const pagination = new Pagination(2, 10)
    const formatted = pagination.formatData({ count: 25, rows: [{ id: 1 }] })

    expect(formatted).toEqual({
      totalItems: 25,
      items: [{ id: 1 }],
      totalPages: 3,
      currentPage: 2
    })
  })

  it('returns 0 totalPages when count is 0', () => {
    const pagination = new Pagination(1, 10)
    const formatted = pagination.formatData({ count: 0, rows: [] })
    expect(formatted.totalPages).toBe(0)
  })
})
