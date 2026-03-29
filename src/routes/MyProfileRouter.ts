import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { MyProfileController } from '../controllers/myProfile'
import { updateMyProfileSchema } from '../schemas/MyProfileSchema'

const MyProfileRoute = Router()

MyProfileRoute.use(MiddleWares.authorization)

MyProfileRoute.get('/', MyProfileController.findMyProfile)

MyProfileRoute.patch(
  '/',
  MiddleWares.validate({ body: updateMyProfileSchema }),
  MyProfileController.updateMyProfile
)

export default MyProfileRoute
