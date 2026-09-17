import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { fileUploadMiddleware } from '../middlewares/fileUpload'
import { uploadFile, getFiles, deleteFile, serveFile } from '../controllers/file'

const FileRoute = Router()

FileRoute.post(
  '/',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  fileUploadMiddleware.single('file'),
  (req, res, next) => {
    void uploadFile(req, res).catch(next)
  }
)

FileRoute.get(
  '/',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  (req, res, next) => {
    void getFiles(req, res).catch(next)
  }
)

FileRoute.delete(
  '/:fileId',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  (req, res, next) => {
    void deleteFile(req, res).catch(next)
  }
)

FileRoute.get('/files/:fileId', (req, res, next) => {
  void serveFile(req, res).catch(next)
})

export default FileRoute
