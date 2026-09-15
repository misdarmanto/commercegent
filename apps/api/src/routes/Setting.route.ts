import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { SettingsController } from '../controllers/settings'
import { createSettingBodySchema, findSettingQuerySchema } from '../schemas/SettingSchema'

const SettingRoute = Router()

SettingRoute.get(
  '/',
  MiddleWares.validate({ query: findSettingQuerySchema }),
  SettingsController.findSetting
)

SettingRoute.post(
  '/',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  MiddleWares.validate({ body: createSettingBodySchema }),
  SettingsController.createSetting
)

export default SettingRoute
