import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { SettingsController } from '../controllers/settings'

const SettingRoute = Router()

SettingRoute.get('/', SettingsController.findSetting)
SettingRoute.post('/', MiddleWares.authorization, SettingsController.createSetting)
SettingRoute.patch('/', MiddleWares.authorization, SettingsController.updateSetting)
SettingRoute.delete(
  '/:settingId',
  MiddleWares.authorization,
  SettingsController.removeSetting
)

export default SettingRoute
