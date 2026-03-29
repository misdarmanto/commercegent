import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { StatisticController } from '../controllers/statistic'

const StatisticRoute = Router()

StatisticRoute.get('/total', MiddleWares.authorization, StatisticController.findTotal)

export default StatisticRoute
