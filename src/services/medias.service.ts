import { Request } from 'express'
import sharp from 'sharp'
import { handleUploadSigleImage } from '../units/file'
import { UPLOAD_IMAGE } from '../constants/dir'
import path from 'path'
import fs from 'fs'
import { isProduction } from '../constants/config'
import { config } from 'dotenv'
config()
class MediasService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadSigleImage(req)
    const outputFilename = `${Date.now()}.jpg`
    const outputPath = path.join(UPLOAD_IMAGE, outputFilename)

    // Xử lý ảnh
    const info = await sharp(file.filepath)
      .jpeg({ quality: 90 }) // Chất lượng 90%
      .toFile(outputPath)

    // Xóa file tạm
    await fs.promises.unlink(file.filepath)

    // có thể return 'http://localhost:3000/uploads/`${outputFilename}`'
    // return {
    //   ...info,
    //   filename: outputFilename,
    //   path: outputPath
    // }
    // return `http://localhost:3000/uploads/${outputFilename}`
    return isProduction
      ? `${process.env.HOST}/static/${outputFilename}.jpg`
      : `http://localhost:${process.env.PORT}/static/${outputFilename}`
  }
}

const mediasService = new MediasService()
export default mediasService
