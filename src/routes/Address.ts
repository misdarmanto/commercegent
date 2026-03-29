import { Router } from 'express'
import { AddressController } from '../controllers/addresses'
import { MiddleWares } from '../middlewares'

const AddressRoute = Router()

AddressRoute.use(MiddleWares.authorization)

AddressRoute.get('/', AddressController.findUserAddress)
AddressRoute.post('/', AddressController.createUserAddress)

AddressRoute.get('/admins', AddressController.findAdminAddress)
AddressRoute.post('/admins', AddressController.createAdminAddress)

AddressRoute.delete('/', AddressController.remove)
AddressRoute.get('/provinces', AddressController.findProvinces)
AddressRoute.get('/regencies/:provinceId', AddressController.findRegencies)
AddressRoute.get('/districts/:regencyId', AddressController.findDistricts)
AddressRoute.get('/villages/:districtId', AddressController.findVillages)

export default AddressRoute
