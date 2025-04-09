import { Router } from 'express'
import { loginValidator, registerValidation } from '../middlewares/users.midlewares'
import { loginController, registerController } from '../controllers/users.controllers'
import validate from '../units/validation'
import { wrapAsync } from '../units/handller'

const usersRouter = Router()

usersRouter.post('/login', loginValidator, loginController)
usersRouter.post('/register', validate(registerValidation), wrapAsync(registerController))

export default usersRouter
