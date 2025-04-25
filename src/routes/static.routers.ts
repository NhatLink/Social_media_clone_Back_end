import { Router } from 'express'
import { serverImageController, serverVideoController } from '../controllers/medias.controllers'
import { wrapAsync } from '../units/handller'

const staticRouter = Router()
//tôi thấy code custom này express.static có hơi thừa và có lẽ ko cần trong 1 số dự án cần kiểm soát video img
// được thì sài express.static trong file index có lẽ còn nhanh hơn
staticRouter.get('/image/:name', serverImageController)
staticRouter.get('/video/:name', wrapAsync(serverVideoController))

export default staticRouter
