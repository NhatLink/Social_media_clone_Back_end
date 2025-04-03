import express, { Request, Response } from 'express'
import usersRouter from './routes/users.routers'

const app = express()
const port = 3000

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World with Express and TypeScript!')
})

app.use(express.json()) // ✅ Cần thiết để đọc req.body
app.use('/users', usersRouter)

app.listen(port, () => {
  console.log(`Server is runnidadasdasdasdng at http://localhost:${port}`)
})
