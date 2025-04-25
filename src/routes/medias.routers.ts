import { Router } from 'express'
import { uploadOneImageController } from '../controllers/medias.controllers'
import { wrapAsync } from '../units/handller'

const mediasRouter = Router()

mediasRouter.post('/upload-image', wrapAsync(uploadOneImageController))

export default mediasRouter
