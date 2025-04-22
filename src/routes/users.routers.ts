import { Router } from 'express'
import {
  accessTokenValidate,
  emailVerifyTokenValidate,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidate,
  registerValidation,
  resetPasswordValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator
} from '../middlewares/users.midlewares'
import {
  emailVerifyController,
  followUserController,
  forgotPasswordController,
  getMeController,
  getUserProfile,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  unfollowUserController,
  updateMeController,
  verifyForgotPasswordTokenController
} from '../controllers/users.controllers'
import validate from '../units/validation'
import { wrapAsync } from '../units/handller'
import { fillterMiddleWare } from '../middlewares/fillter.midlewares'
import { UpdateMeReqBody } from '../models/requests/users.requests'

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
usersRouter.patch(
  '/update-profile',
  validate(accessTokenValidate),
  verifiedUserValidator,
  validate(updateMeValidator),
  fillterMiddleWare<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ]),
  wrapAsync(updateMeController)
)
usersRouter.get('/:username', wrapAsync(getUserProfile))
usersRouter.post(
  '/follow',
  validate(accessTokenValidate),
  verifiedUserValidator,
  validate(followValidator),
  wrapAsync(followUserController)
)
usersRouter.post(
  '/unfollow',
  validate(accessTokenValidate),
  verifiedUserValidator,
  validate(followValidator),
  wrapAsync(unfollowUserController)
)
export default usersRouter
