import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { handleProductExcelUpload } from '../middlewares/productExcelUpload'
import { UploadProductController } from '../controllers/uploadProduct'
import { uploadHistoriesQuerySchema } from '../schemas/ProductSchema'

const UploadProductRoute = Router()

UploadProductRoute.post(
  '/upload-excel',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  handleProductExcelUpload,
  UploadProductController.uploadProductExcel
)

UploadProductRoute.get(
  '/upload-histories',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  MiddleWares.validate({ query: uploadHistoriesQuerySchema }),
  UploadProductController.uploadHistories
)

export default UploadProductRoute
