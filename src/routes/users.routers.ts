import { Request, Response, Router } from 'express'
import { loginValidator } from '../middlewares/users.midlewares'
import { loginController } from '../controllers/users.controllers'

const usersRouter = Router()

usersRouter.post('/login', loginValidator, loginController)

export default usersRouter
