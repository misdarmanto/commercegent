import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { StatisticController } from '../controllers/statistic'
import { findTotalStatisticSchema } from '../schemas/StatisticSchema'

const StatisticRoute = Router()

StatisticRoute.get(
  '/total',
  MiddleWares.authorization,
  MiddleWares.validate({ query: findTotalStatisticSchema }),
  StatisticController.findTotalStatistic
)

export default StatisticRoute
