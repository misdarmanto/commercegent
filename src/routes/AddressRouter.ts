import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { AddressController } from '../controllers/addresses'
import {
  createAddressSchema,
  districtsParamsSchema,
  regenciesParamsSchema,
  removeAddressQuerySchema,
  villagesParamsSchema
} from '../schemas/AddressSchema'

const AddressRoute = Router()

AddressRoute.use(MiddleWares.authorization)

AddressRoute.get('/', AddressController.findUserAddress)

AddressRoute.post(
  '/',
  MiddleWares.validate({ body: createAddressSchema }),
  AddressController.createUserAddress
)

AddressRoute.get('/admins', AddressController.findAdminAddress)

AddressRoute.post(
  '/admins',
  MiddleWares.validate({ body: createAddressSchema }),
  AddressController.createAdminAddress
)

AddressRoute.delete(
  '/',
  MiddleWares.validate({ query: removeAddressQuerySchema }),
  AddressController.removeAddress
)

AddressRoute.get('/provinces', AddressController.findProvinces)

AddressRoute.get(
  '/regencies/:provinceId',
  MiddleWares.validate({ params: regenciesParamsSchema }),
  AddressController.findRegencies
)

AddressRoute.get(
  '/districts/:regencyId',
  MiddleWares.validate({ params: districtsParamsSchema }),
  AddressController.findDistricts
)

AddressRoute.get(
  '/villages/:districtId',
  MiddleWares.validate({ params: villagesParamsSchema }),
  AddressController.findVillages
)

export default AddressRoute
