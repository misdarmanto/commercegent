import { z } from 'zod'
import { validate } from './validate'

function mockRes() {
  const res: any = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('validate middleware', () => {
  it('calls next() and replaces req.body with the parsed data when valid', () => {
    const schema = z.object({ name: z.string(), age: z.coerce.number() })
    const req: any = { body: { name: 'Jane', age: '30' }, query: {}, params: {} }
    const res = mockRes()
    const next = jest.fn()

    validate({ body: schema })(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(req.body).toEqual({ name: 'Jane', age: 30 })
  })

  it('returns 400 with flattened errors when body validation fails', () => {
    const schema = z.object({ name: z.string() })
    const req: any = { body: {}, query: {}, params: {} }
    const res = mockRes()
    const next = jest.fn()

    validate({ body: schema })(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, errors: expect.anything() })
    )
    expect(next).not.toHaveBeenCalled()
  })

  it('validates query and params independently of body', () => {
    const req: any = {
      body: {},
      query: { page: '2' },
      params: { id: 'abc' }
    }
    const res = mockRes()
    const next = jest.fn()

    validate({
      query: z.object({ page: z.coerce.number() }),
      params: z.object({ id: z.string() })
    })(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(req.query).toEqual({ page: 2 })
    expect(req.params).toEqual({ id: 'abc' })
  })

  it('skips locations that have no schema configured', () => {
    const req: any = { body: { anything: true }, query: {}, params: {} }
    const res = mockRes()
    const next = jest.fn()

    validate({})(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(req.body).toEqual({ anything: true })
  })
})
