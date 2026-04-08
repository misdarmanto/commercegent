import { Router } from 'express'
import { AppLogController } from '../controllers/appLog'
import { MiddleWares } from '../middlewares'
import { createAppLogSchema, findAllAppLogsSchema } from '../schemas/AppLogSchema'

const AppLogRoute = Router()

AppLogRoute.use(MiddleWares.authorization)

AppLogRoute.post(
  '/',
  MiddleWares.validate({ body: createAppLogSchema }),
  AppLogController.createAppLog
)

AppLogRoute.get(
  '/',
  MiddleWares.validate({ query: findAllAppLogsSchema }),
  AppLogController.findAllAppLogs
)

export default AppLogRoute
