import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { SettingsController } from '../controllers/settings'
import {
  createSettingBodySchema,
  findSettingQuerySchema,
  removeSettingParamsSchema,
  updateSettingBodySchema
} from '../schemas/SettingSchema'

const SettingRoute = Router()

SettingRoute.get(
  '/',
  MiddleWares.validate({ query: findSettingQuerySchema }),
  SettingsController.findSetting
)

SettingRoute.post(
  '/',
  MiddleWares.authorization,
  MiddleWares.validate({ body: createSettingBodySchema }),
  SettingsController.createSetting
)

SettingRoute.patch(
  '/',
  MiddleWares.authorization,
  MiddleWares.validate({ body: updateSettingBodySchema }),
  SettingsController.updateSetting
)

SettingRoute.delete(
  '/:settingId',
  MiddleWares.authorization,
  MiddleWares.validate({ params: removeSettingParamsSchema }),
  SettingsController.removeSetting
)

export default SettingRoute
