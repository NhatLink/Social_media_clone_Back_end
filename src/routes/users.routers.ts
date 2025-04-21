import { Router } from 'express'
import {
  accessTokenValidate,
  emailVerifyTokenValidate,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidate,
  registerValidation,
  resetPasswordValidator,
  verifyForgotPasswordTokenValidator
} from '../middlewares/users.midlewares'
import {
  emailVerifyController,
  forgotPasswordController,
  getMeController,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  verifyForgotPasswordTokenController
} from '../controllers/users.controllers'
import validate from '../units/validation'
import { wrapAsync } from '../units/handller'

const usersRouter = Router()

usersRouter.post('/login', validate(loginValidator), wrapAsync(loginController))
usersRouter.post('/logout', validate(accessTokenValidate), validate(refreshTokenValidate), wrapAsync(logoutController))
usersRouter.post('/verify-email', validate(emailVerifyTokenValidate), wrapAsync(emailVerifyController))
usersRouter.post('/resend-verify-email', validate(accessTokenValidate), wrapAsync(resendEmailVerifyController))
usersRouter.post('/register', validate(registerValidation), wrapAsync(registerController))
usersRouter.post('/forgot-password', validate(forgotPasswordValidator), wrapAsync(forgotPasswordController))
usersRouter.post(
  '/verify-forgot-password-token',
  validate(verifyForgotPasswordTokenValidator),
  wrapAsync(verifyForgotPasswordTokenController)
)
usersRouter.post('/reset-password', validate(resetPasswordValidator), wrapAsync(resetPasswordController))
usersRouter.get('/me', validate(accessTokenValidate), wrapAsync(getMeController))
export default usersRouter
