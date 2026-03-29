import { Router } from 'express'
import { AdminController } from '../controllers/admin'
import { MiddleWares } from '../middlewares'
import {
  findAllAdminsSchema,
  findDetailAdminSchema,
  updateAdminSchema
} from '../schemas/AdminSchema'
import { loginAdminSchema, signupAdminSchema } from '../schemas/AuthSchema'

const AdminRoute = Router()

AdminRoute.get(
  '/',
  MiddleWares.authorization,
  MiddleWares.validate({ query: findAllAdminsSchema }),
  AdminController.findAllAdmin
)

AdminRoute.get(
  '/detail/:adminId',
  MiddleWares.authorization,
  MiddleWares.validate({ query: findDetailAdminSchema }),
  AdminController.findDetailAdmin
)

AdminRoute.patch(
  '/',
  MiddleWares.authorization,
  MiddleWares.validate({ body: updateAdminSchema }),
  AdminController.updateAdmin
)

AdminRoute.post(
  '/register',
  MiddleWares.authorization,
  MiddleWares.validate({ body: signupAdminSchema }),
  AdminController.createAdmin
)

AdminRoute.post(
  '/login',
  MiddleWares.validate({ body: loginAdminSchema }),
  AdminController.loginAdmin
)

export default AdminRoute
