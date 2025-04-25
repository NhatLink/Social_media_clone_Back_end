import express, { NextFunction, Request, Response } from 'express'
import usersRouter from './routes/users.routers'
import databaseService from './services/database.services'
import { errorHandlerDefault } from './middlewares/error.midlewares'
import mediasRouter from './routes/medias.routers'
import { ensureUploadDir } from './units/file'
import { config } from 'dotenv'
import { UPLOAD_IMAGE, UPLOAD_VIDEO } from './constants/dir'
import staticRouter from './routes/static.routers'
config()
const app = express()
const port = 3000
ensureUploadDir()
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World with Express and TypeScript!')
})
app.use(express.json()) // ✅ Cần thiết để đọc req.body
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/static', staticRouter)
// app.use('/static/video', express.static(UPLOAD_VIDEO))
databaseService.connect()
app.use(errorHandlerDefault)
app.listen(process.env.PORT, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`)
})
