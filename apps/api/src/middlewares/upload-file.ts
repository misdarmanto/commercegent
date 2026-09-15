import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(file)
    cb(null, './public/products-images')
  },
  filename: (req, file, cb) => {
    console.log(file)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

export const uploadMidleWare = multer({ storage })
