import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { WaBlasController } from '../controllers/waBlass'

const WablasRoute = Router()

WablasRoute.use(MiddleWares.authorization)
WablasRoute.post('/send-message', WaBlasController.send)
WablasRoute.get('/history', WaBlasController.findAllHistory)
WablasRoute.get('/history/detail/:waBlasHistoryId', WaBlasController.findDetailHistory)
WablasRoute.delete('/', WaBlasController.removeWablasHistory)

export default WablasRoute
