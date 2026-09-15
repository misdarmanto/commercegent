import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { AddressController } from '../controllers/addresses'
import {
  createAddressSchema,
  findAllAddressesSchema,
  removeAddressQuerySchema,
  updateAddressSchema,
  updateAddressTypeSchema
} from '../schemas/addressSchema'

const AddressRoute = Router()

AddressRoute.use(MiddleWares.authorization)

AddressRoute.get(
  '/users',
  MiddleWares.validate({ query: findAllAddressesSchema }),
  AddressController.findUserAddress
)

AddressRoute.post(
  '/users',
  MiddleWares.validate({ body: createAddressSchema }),
  AddressController.createUserAddress
)

AddressRoute.patch(
  '/to-main',
  MiddleWares.validate({ body: updateAddressTypeSchema }),
  AddressController.updateAddressToMain
)

AddressRoute.get(
  '/admins',
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  MiddleWares.validate({ query: findAllAddressesSchema }),
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
  '/:addressId',
  MiddleWares.validate({ params: removeAddressQuerySchema }),
  AddressController.removeAddress
)

export default AddressRoute
