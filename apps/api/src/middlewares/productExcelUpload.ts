import { type NextFunction, type Request, type Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { ResponseData } from '../utilities/response'

const uploadDir = path.resolve(process.cwd(), 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`
    cb(null, uniqueName)
  }
})

const excelFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ]

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only Excel files (.xls, .xlsx) are allowed!'))
  }
  cb(null, true)
}

export const productExcelUploadMiddleware = multer({
  storage,
  fileFilter: excelFileFilter
}).single('file')

/** Menjalankan multer dan mengembalikan 400 jika file tidak valid (bukan next(err)). */
export const handleProductExcelUpload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  productExcelUploadMiddleware(req, res, (err: unknown) => {
    if (err != null) {
      const message = err instanceof Error ? err.message : 'Invalid file upload'
      res.status(400).json(ResponseData.error({ message }))
      return
    }
    next()
  })
}
