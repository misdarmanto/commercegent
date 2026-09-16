import fs from 'fs'
import { StatusCodes } from 'http-status-codes'
import { UploadProductService } from './UploadProduct.service'
import { FileUploadModel } from '../models/FileUploadModel'
import { addProductFileToQueue } from '../queues/productFileQueue'

jest.mock('../models/FileUploadModel', () => ({
  FileUploadModel: { create: jest.fn(), findAndCountAll: jest.fn() }
}))
jest.mock('../queues/productFileQueue', () => ({ addProductFileToQueue: jest.fn() }))
jest.mock('../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))
jest.mock('fs', () => ({ existsSync: jest.fn(), unlink: jest.fn() }))

const mockedCreate = FileUploadModel.create as jest.Mock
const mockedFindAndCountAll = FileUploadModel.findAndCountAll as jest.Mock
const mockedAddToQueue = addProductFileToQueue as jest.Mock
const mockedExistsSync = fs.existsSync as jest.Mock

describe('UploadProductService.recordExcelUpload', () => {
  const file = { path: '/tmp/upload.xlsx', originalname: 'upload.xlsx' }

  it('creates a file record and enqueues it for processing', async () => {
    mockedCreate.mockResolvedValue({ fileId: 1, fileName: 'upload.xlsx', status: 'PENDING' })
    mockedAddToQueue.mockResolvedValue(undefined)

    const result = await UploadProductService.recordExcelUpload(file)

    expect(mockedAddToQueue).toHaveBeenCalledWith(1, file.path)
    expect(result).toEqual({ fileId: 1, fileName: 'upload.xlsx', status: 'PENDING' })
  })

  it('removes the temp file and throws a 500 AppError when creation fails', async () => {
    mockedCreate.mockRejectedValue(new Error('db down'))
    mockedExistsSync.mockReturnValue(true)

    await expect(UploadProductService.recordExcelUpload(file)).rejects.toMatchObject({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR
    })
    expect(fs.unlink).toHaveBeenCalledWith(file.path, expect.any(Function))
  })

  it('does not try to remove the temp file when it no longer exists', async () => {
    mockedCreate.mockRejectedValue(new Error('db down'))
    mockedExistsSync.mockReturnValue(false)
    ;(fs.unlink as unknown as jest.Mock).mockClear()

    await expect(UploadProductService.recordExcelUpload(file)).rejects.toBeTruthy()
    expect(fs.unlink).not.toHaveBeenCalled()
  })
})

describe('UploadProductService.findUploadHistories', () => {
  it('filters by status when provided', async () => {
    mockedFindAndCountAll.mockResolvedValue({ count: 0, rows: [] })

    await UploadProductService.findUploadHistories({ page: 1, size: 10, status: 'DONE' } as any)

    const where = mockedFindAndCountAll.mock.calls[0][0].where
    expect(where.status).toBeDefined()
  })

  it('formats the paginated result', async () => {
    mockedFindAndCountAll.mockResolvedValue({ count: 2, rows: [{ fileId: 1 }] })

    const result = await UploadProductService.findUploadHistories({ page: 1, size: 10 } as any)

    expect(result.totalItems).toBe(2)
    expect(result.items).toEqual([{ fileId: 1 }])
  })
})
