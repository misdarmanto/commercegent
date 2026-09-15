import { Router } from 'express'
import { healthCheckController, mainController } from '../controllers/health'

const HealthRoute = Router()

HealthRoute.get('/', mainController)
HealthRoute.get('/health', healthCheckController)

export default HealthRoute
