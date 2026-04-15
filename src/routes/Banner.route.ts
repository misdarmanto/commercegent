import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { CategoryController } from '../controllers/categories'
import {
  createBannerSchema,
  findAllBannersSchema,
  removeBannerSchema
} from '../schemas/BannerSchema'
import { BannerController } from '../controllers/banner'

const BanerRoute = Router()

BanerRoute.get(
  '/',
  MiddleWares.validate({ query: findAllBannersSchema }),
  BannerController.findAllBanners
)

BanerRoute.post(
  '/',
  MiddleWares.authorization,
  MiddleWares.validate({ body: createBannerSchema }),
  BannerController.createBanner
)

BanerRoute.delete(
  '/',
  MiddleWares.authorization,
  MiddleWares.validate({ query: removeBannerSchema }),
  BannerController.removeBanner
)

export default BanerRoute
