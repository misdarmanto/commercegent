import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { AddressController } from '../controllers/addresses'
import { createAddressSchema, removeAddressQuerySchema } from '../schemas/AddressSchema'

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

export default AddressRoute
