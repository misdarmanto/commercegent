import multer from 'multer'

jest.mock('multer', () => {
  const multerMock: any = jest.fn((opts: any) => opts)
  multerMock.diskStorage = jest.fn((opts: any) => opts)
  return multerMock
})

import './upload-file'

const mockedDiskStorage = multer.diskStorage as jest.Mock
const storageOptions = mockedDiskStorage.mock.calls[0][0]

describe('upload-file storage config', () => {
  it('stores files under ./public/products-images', () => {
    const cb = jest.fn()
    storageOptions.destination({}, { originalname: 'a.jpg' }, cb)
    expect(cb).toHaveBeenCalledWith(null, './public/products-images')
  })

  it('generates a unique filename that preserves the original extension', () => {
    const cb = jest.fn()
    storageOptions.filename({}, { fieldname: 'file', originalname: 'photo.png' }, cb)

    const [err, filename] = cb.mock.calls[0]
    expect(err).toBeNull()
    expect(filename).toMatch(/^file-\d+-\d+\.png$/)
  })
})
