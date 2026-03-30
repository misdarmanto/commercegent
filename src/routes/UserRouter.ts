import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { UsersController } from '../controllers/users'
import {
  findAllUsersSchema,
  removeUserQuerySchema,
  requestOtpSchema,
  updateUserCoinSchema,
  userDetailParamsSchema,
  userLoginSchema,
  userRegisterSchema,
  userUpdatePasswordSchema,
  userUpdateSchema,
  verifyOtpSchema
} from '../schemas/UserSchema'

const UserRoute = Router()

UserRoute.get(
  '/',
  MiddleWares.authorization,
  MiddleWares.validate({ query: findAllUsersSchema }),
  UsersController.findAll
)
UserRoute.get(
  '/detail/:userId',
  MiddleWares.authorization,
  MiddleWares.validate({ params: userDetailParamsSchema }),
  UsersController.findDetailUser
)
UserRoute.post(
  '/login',
  MiddleWares.validate({ body: userLoginSchema }),
  UsersController.login
)
UserRoute.post(
  '/register',
  MiddleWares.validate({ body: userRegisterSchema }),
  UsersController.register
)
UserRoute.patch(
  '/',
  MiddleWares.authorization,
  MiddleWares.validate({ body: userUpdateSchema }),
  UsersController.update
)
UserRoute.delete(
  '/',
  MiddleWares.authorization,
  MiddleWares.validate({ query: removeUserQuerySchema }),
  UsersController.remove
)
UserRoute.patch(
  '/update-coin',
  MiddleWares.authorization,
  MiddleWares.validate({ body: updateUserCoinSchema }),
  UsersController.updateUserCoin
)
UserRoute.patch(
  '/update-password',
  MiddleWares.validate({ body: userUpdatePasswordSchema }),
  UsersController.updatePassword
)
UserRoute.post(
  '/otp/request',
  MiddleWares.validate({ body: requestOtpSchema }),
  UsersController.requestOtp
)
UserRoute.post(
  '/otp/verify',
  MiddleWares.validate({ body: verifyOtpSchema }),
  UsersController.verifyOtp
)

export default UserRoute
