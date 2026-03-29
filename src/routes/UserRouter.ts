import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { UsersController } from '../controllers/users'

const UserRoute = Router()

UserRoute.get('/', MiddleWares.authorization, UsersController.findAll)
UserRoute.get(
  '/detail/:userId',
  MiddleWares.authorization,
  UsersController.findDetailUser
)
UserRoute.post('/login', UsersController.login)
UserRoute.post('/register', UsersController.register)
UserRoute.patch('/', MiddleWares.authorization, UsersController.update)
UserRoute.delete('/', MiddleWares.authorization, UsersController.remove)
UserRoute.patch('/update-coin', MiddleWares.authorization, UsersController.updateUserCoin)
UserRoute.patch('/update-password', UsersController.updatePassword)
UserRoute.post('/otp/request', UsersController.requestOtp)
UserRoute.post('/otp/verify', UsersController.verifyOtp)

export default UserRoute
