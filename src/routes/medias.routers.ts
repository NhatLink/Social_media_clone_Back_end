import { Router } from 'express'
import { uploadImagesController, uploadVideoController } from '../controllers/medias.controllers'
import { wrapAsync } from '../units/handller'
import validate from '../units/validation'
import { accessTokenValidate, verifiedUserValidator } from '../middlewares/users.midlewares'

const mediasRouter = Router()

mediasRouter.post(
  '/upload-images',
  validate(accessTokenValidate),
  verifiedUserValidator,
  wrapAsync(uploadImagesController)
)
mediasRouter.post(
  '/upload-video',
  validate(accessTokenValidate),
  verifiedUserValidator,
  wrapAsync(uploadVideoController)
)

export default mediasRouter
