import { Router } from 'express'
import {
  accessTokenValidate,
  emailVerifyTokenValidate,
  loginValidator,
  refreshTokenValidate,
  registerValidation
} from '../middlewares/users.midlewares'
import {
  emailVerifyController,
  loginController,
  logoutController,
  registerController
} from '../controllers/users.controllers'
import validate from '../units/validation'
import { wrapAsync } from '../units/handller'

const usersRouter = Router()

usersRouter.post('/login', validate(loginValidator), wrapAsync(loginController))
usersRouter.post('/logout', validate(accessTokenValidate), validate(refreshTokenValidate), wrapAsync(logoutController))
usersRouter.post('/verify-email', validate(emailVerifyTokenValidate), wrapAsync(emailVerifyController))
usersRouter.post('/register', validate(registerValidation), wrapAsync(registerController))

export default usersRouter
