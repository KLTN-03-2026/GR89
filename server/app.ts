import express, { NextFunction, Request, Response } from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { ErrorMiddleware } from './middleware/error'
import { mainRouter } from './routes/route'
import { getCorsConfig } from './config/cors.config'
import path from 'path'

dotenv.config()
export const app = express()

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

app.use(cookieParser())

app.use(cors(getCorsConfig()))

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use('/api', mainRouter)

app.get('/test', (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: 'API thành công',
  })
})

app.all(/.*/, (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any
  err.statusCode = 404
  next(err)
})


app.use(ErrorMiddleware)
