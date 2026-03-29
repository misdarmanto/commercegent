import { createNotification } from './create'
import { findAllNotification, findDetailNotification } from './find'
import { removeNofication } from './remove'
import { updateNotification } from './update'
import { updatePushToken } from './updatePushToken'

export const NotificationController = {
  create: createNotification,
  findAll: findAllNotification,
  findOne: findDetailNotification,
  remove: removeNofication,
  update: updateNotification,
  updatePushToken
}
