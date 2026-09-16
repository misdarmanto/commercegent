import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { handleProductExcelUpload } from '../middlewares/productExcelUpload'
import { UploadProductController } from '../controllers/uploadProduct'
import { uploadHistoriesQuerySchema } from '../schemas/productSchema'

const UploadProductRoute = Router()

UploadProductRoute.post(
  '/',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  handleProductExcelUpload,
  UploadProductController.uploadProductExcel
)

UploadProductRoute.get(
  '/histories',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  MiddleWares.validate({ query: uploadHistoriesQuerySchema }),
  UploadProductController.uploadHistories
)

export default UploadProductRoute
