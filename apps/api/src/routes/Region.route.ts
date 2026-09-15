import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import {
  districtsParamsSchema,
  regenciesParamsSchema,
  villagesParamsSchema
} from '../schemas/RegionSchema'
import { RegionController } from '../controllers/region'

const RegionRoute = Router()

RegionRoute.use(MiddleWares.authorization)

RegionRoute.get('/provinces', RegionController.findProvinces)

RegionRoute.get(
  '/regencies/:provinceId',
  MiddleWares.validate({ params: regenciesParamsSchema }),
  RegionController.findRegencies
)

RegionRoute.get(
  '/districts/:regencyId',
  MiddleWares.validate({ params: districtsParamsSchema }),
  RegionController.findDistricts
)

RegionRoute.get(
  '/villages/:districtId',
  MiddleWares.validate({ params: villagesParamsSchema }),
  RegionController.findVillages
)

export default RegionRoute
