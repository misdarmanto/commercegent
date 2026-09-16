const mockSingleMiddleware = jest.fn()

jest.mock('fs', () => ({ existsSync: jest.fn(() => true), mkdirSync: jest.fn() }))
jest.mock('multer', () => {
  const multerMock: any = jest.fn(() => ({ single: () => mockSingleMiddleware }))
  multerMock.diskStorage = jest.fn((opts: any) => opts)
  return multerMock
})

import { handleProductExcelUpload } from './productExcelUpload'

function mockRes() {
  const res: any = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('handleProductExcelUpload', () => {
  it('calls next() when the upload succeeds', () => {
    mockSingleMiddleware.mockImplementation((_req: any, _res: any, cb: any) => cb(null))
    const req: any = {}
    const res = mockRes()
    const next = jest.fn()

    handleProductExcelUpload(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('returns 400 with the error message when the upload fails', () => {
    mockSingleMiddleware.mockImplementation((_req: any, _res: any, cb: any) =>
      cb(new Error('Only Excel files (.xls, .xlsx) are allowed!'))
    )
    const req: any = {}
    const res = mockRes()
    const next = jest.fn()

    handleProductExcelUpload(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Only Excel files (.xls, .xlsx) are allowed!'
      })
    )
    expect(next).not.toHaveBeenCalled()
  })

  it('returns a generic message when the error is not an Error instance', () => {
    mockSingleMiddleware.mockImplementation((_req: any, _res: any, cb: any) => cb('weird error'))
    const req: any = {}
    const res = mockRes()
    const next = jest.fn()

    handleProductExcelUpload(req, res, next)

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid file upload' })
    )
  })
})
