import { Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { FileUploadAttributes, FileUploadModel } from '../../models/fileUpload'
import { addProductFileToQueue } from '../../queues/productFileQueue'
import { handleServerError } from '../../utilities/requestHandler'

// === 1️⃣ Tentukan folder upload di root project ===
const uploadDir = path.resolve(process.cwd(), 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// === 2️⃣ Konfigurasi storage Multer ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`
    cb(null, uniqueName)
  }
})

// === 3️⃣ Filter hanya untuk file Excel ===
const excelFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel' // .xls
  ]

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only Excel files (.xls, .xlsx) are allowed!'))
  }
  cb(null, true)
}

// === 4️⃣ Buat instance multer ===
const upload = multer({
  storage,
  fileFilter: excelFileFilter
}).single('file')

// === 5️⃣ Controller upload Excel ===
export const uploadProductExcel = (req: Request, res: Response) => {
  upload(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Invalid file upload'
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload an Excel file (.xls / .xlsx)'
      })
    }

    try {
      const payload = {
        fileName: req.file.originalname,
        filePath: req.file.path,
        status: 'PENDING'
      } as FileUploadAttributes

      // Simpan ke tabel file_upload
      const fileRecord = await FileUploadModel.create(payload)

      // Tambahkan ke queue BullMQ
      await addProductFileToQueue(fileRecord.fileId, req.file.path)

      return res.status(202).json({
        success: true,
        message: 'File uploaded successfully, processing started in background',
        data: {
          fileId: fileRecord.fileId,
          fileName: fileRecord.fileName,
          status: fileRecord.status
        }
      })
    } catch (serverError) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlink(req.file.path, () => {})
      }

      return handleServerError(res, serverError)
    }
  })
}
