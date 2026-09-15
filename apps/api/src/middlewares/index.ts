import { allowAppRoles } from './appRole'
import { authorization } from './authorization'
import { corsOrigin } from './cors'
import { limiter } from './limiter'
import { loggerMidleWare } from './morgan'
import { uploadMidleWare } from './upload-file'
import { validate } from './validate'

export const MiddleWares = {
  authorization,
  corsOrigin,
  limiter,
  loggerMidleWare,
  uploadMidleWare,
  allowAppRoles,
  validate
}
