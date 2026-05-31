import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { StatisticController } from '../controllers/statistic'
import {
  createVisitorSchema,
  findTotalStatisticSchema,
  findTotalVisitorSchema
} from '../schemas/StatisticSchema'

const StatisticRoute = Router()

StatisticRoute.get(
  '/total',
  MiddleWares.authorization,
  MiddleWares.validate({ query: findTotalStatisticSchema }),
  StatisticController.findTotalStatistic
)

StatisticRoute.get(
  '/visitor',
  MiddleWares.authorization,
  MiddleWares.validate({ query: findTotalVisitorSchema }),
  StatisticController.findTotalVisitor
)

StatisticRoute.post(
  '/visitor',
  MiddleWares.authorization,
  MiddleWares.validate({ body: createVisitorSchema }),
  StatisticController.createVisitor
)
export default StatisticRoute
