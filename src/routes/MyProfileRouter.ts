import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { MyProfileController } from '../controllers/myProfile'

const MyProfileRoute = Router()

MyProfileRoute.use(MiddleWares.authorization)
MyProfileRoute.get('/', MyProfileController.find)
MyProfileRoute.patch('/', MyProfileController.update)

export default MyProfileRoute
