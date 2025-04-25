import { Request } from 'express'
import sharp from 'sharp'
import { handleUploadImages, handleUploadVideo } from '../units/file'
import { UPLOAD_IMAGE, UPLOAD_VIDEO } from '../constants/dir'
import path from 'path'
import fs from 'fs'
import { isProduction } from '../constants/config'
import { config } from 'dotenv'
import { MediaType } from '../constants/enums'
config()
class MediasService {
  async uploadImages(req: Request) {
    const files = await handleUploadImages(req)
    const results = await Promise.all(
      files.map(async (file) => {
        const outputFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`
        const outputPath = path.join(UPLOAD_IMAGE, outputFilename)

        // Xử lý ảnh
        const info = await sharp(file.filepath).jpeg({ quality: 90 }).toFile(outputPath)

        // Xóa file tạm
        await fs.promises.unlink(file.filepath)

        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${outputFilename}`
            : `http://localhost:${process.env.PORT}/static/image/${outputFilename}`,
          type: MediaType.Image,
          info: info
        }
      })
    )

    return results
  }
  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const results = await Promise.all(
      files.map(async (file) => {
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${path.extname(file.originalFilename || '')}`
        const outputPath = path.join(UPLOAD_VIDEO, uniqueName)

        // Di chuyển file từ thư mục temp đến thư mục đích (video thường không cần xử lý như ảnh)
        await fs.promises.rename(file.filepath, outputPath)

        return {
          url: isProduction
            ? `${process.env.HOST}/static/video/${uniqueName}`
            : `http://localhost:${process.env.PORT}/static/video/${uniqueName}`,
          type: MediaType.Video,
          originalName: file.originalFilename,
          size: file.size
        }
      })
    )

    return results
  }
}

const mediasService = new MediasService()
export default mediasService
