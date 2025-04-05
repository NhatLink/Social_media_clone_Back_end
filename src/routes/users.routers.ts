import { Request, Response, Router } from 'express'
import { loginValidator } from '../middlewares/users.midlewares'
import { loginController, registerController } from '../controllers/users.controllers'

const usersRouter = Router()

usersRouter.post('/login', loginValidator, loginController)
usersRouter.post('/register', registerController)

export default usersRouter
