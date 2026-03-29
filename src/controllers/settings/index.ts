import { createSetting } from './create'
import { findSetting } from './find'
import { removeSetting } from './remove'
import { updateSetting } from './update'

export const SettingsController = {
  findSetting,
  createSetting,
  updateSetting,
  removeSetting
}
