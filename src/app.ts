import express from 'express'
import cors from 'cors'
import "express-async-errors"
import { errorHandling } from './middlewares/erro-handling'
import { routes } from './routes'

import uploadConfig from './configs/upload'

export const app = express()

app.use(cors())
app.use(express.json())

app.use('/uploads', express.static(uploadConfig.UPLOADS_FOLDER))

app.use(routes)

app.use(errorHandling)
