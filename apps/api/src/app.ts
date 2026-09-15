import express, { type Express } from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
// import helmet from 'helmet'
import compression from 'compression'
import routers from './routes'
import { MiddleWares } from './middlewares'

const app: Express = express()

// app.use(helmet())
app.use(MiddleWares.corsOrigin())
// app.use(MiddleWares.limiter())
app.use(MiddleWares.loggerMidleWare())

app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
app.use(bodyParser.json({ limit: '10mb' }))
app.use(cookieParser())
app.use(compression())

app.use(routers)

export default app
