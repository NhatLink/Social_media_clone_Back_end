import { Router } from 'express'
import { loginValidator, registerValidation } from '../middlewares/users.midlewares'
import { loginController, registerController } from '../controllers/users.controllers'
import validate, { validateAll } from '../units/validation'
import { wrapAsync } from '../units/handller'

const usersRouter = Router()

usersRouter.post('/login', loginValidator, loginController)
usersRouter.post('/register', validateAll(registerValidation), wrapAsync(registerController))

export default usersRouter
