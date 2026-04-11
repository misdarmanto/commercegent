import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { AddressController } from '../controllers/addresses'
import {
  createAddressSchema,
  removeAddressQuerySchema,
  updateAddressSchema
} from '../schemas/AddressSchema'

const AddressRoute = Router()

AddressRoute.use(MiddleWares.authorization)

AddressRoute.get('/users', AddressController.findUserAddress)

AddressRoute.post(
  '/users',
  MiddleWares.validate({ body: createAddressSchema }),
  AddressController.createUserAddress
)

AddressRoute.get(
  '/admins',
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  AddressController.findAdminAddress
)

AddressRoute.post(
  '/admins',
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  MiddleWares.validate({ body: createAddressSchema }),
  AddressController.createAdminAddress
)

AddressRoute.patch(
  '/',
  MiddleWares.validate({ body: updateAddressSchema }),
  AddressController.updateAdminAddress
)

AddressRoute.delete(
  '/',
  MiddleWares.validate({ query: removeAddressQuerySchema }),
  AddressController.removeAddress
)

export default AddressRoute
