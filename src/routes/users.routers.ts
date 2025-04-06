import { Request, Response, Router } from 'express'
import { loginValidator, registerValidation } from '../middlewares/users.midlewares'
import { loginController, registerController } from '../controllers/users.controllers'
import validate from '../units/validation'

const usersRouter = Router()

usersRouter.post('/login', loginValidator, loginController)
usersRouter.post('/register', validate(registerValidation), registerController)

export default usersRouter
