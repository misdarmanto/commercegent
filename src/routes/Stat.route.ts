import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { StatController } from '../controllers/stats'
import { findStatQuerySchema } from '../schemas/StatSchema'

const StatRoute = Router()

StatRoute.get(
  '/',
  MiddleWares.authorization,
  MiddleWares.validate({ query: findStatQuerySchema }),
  StatController.findStat
)

export default StatRoute
