import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { UsersController } from '../controllers/users'
import {
  findAllUsersSchema,
  removeUserQuerySchema,
  updateUserCoinSchema,
  userDetailParamsSchema,
  userUpdatePasswordSchema,
  userUpdateSchema
} from '../schemas/UserSchema'

const UserRoute = Router()

UserRoute.get(
  '/',
  MiddleWares.authorization,
  MiddleWares.validate({ query: findAllUsersSchema }),
  UsersController.findAllUsers
)

UserRoute.get(
  '/detail/:userId',
  MiddleWares.authorization,
  MiddleWares.validate({ params: userDetailParamsSchema }),
  UsersController.findDetailUser
)

UserRoute.patch(
  '/',
  MiddleWares.authorization,
  MiddleWares.validate({ body: userUpdateSchema }),
  UsersController.updateSelfUser
)

UserRoute.delete(
  '/',
  MiddleWares.authorization,
  MiddleWares.validate({ query: removeUserQuerySchema }),
  UsersController.removeUser
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
  UsersController.updateUserPassword
)

export default UserRoute
