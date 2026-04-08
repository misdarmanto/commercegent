import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { StatisticController } from '../controllers/statistic'
import { findTotalStatisticQuerySchema } from '../schemas/StatisticSchema'

const StatisticRoute = Router()

StatisticRoute.get(
  '/total',
  MiddleWares.authorization,
  MiddleWares.validate({ query: findTotalStatisticQuerySchema }),
  StatisticController.findTotal
)

export default StatisticRoute
