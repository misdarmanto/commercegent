import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { loginAdminSchema, loginUserSchema } from '../schemas/AuthSchema'
import { AuthController } from '../controllers/auth'
import { userRegisterSchema } from '../schemas/UserSchema'

const AuthRoute = Router()

AuthRoute.post(
  '/admin/login',
  MiddleWares.validate({ body: loginAdminSchema }),
  AuthController.loginAdmin
)

AuthRoute.post(
  '/user/login',
  MiddleWares.validate({ body: loginUserSchema }),
  AuthController.loginUser
)

AuthRoute.post(
  '/user/register',
  MiddleWares.validate({ body: userRegisterSchema }),
  AuthController.registerUser
)

export default AuthRoute
