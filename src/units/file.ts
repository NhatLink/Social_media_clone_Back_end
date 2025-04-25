import fs from 'fs'
import path from 'path'
import { UPLOAD_IMAGE_TEMP } from '../constants/dir'
import formidable, { File } from 'formidable'
import { Request } from 'express'

export const ensureUploadDir = () => {
  const uploadDir = UPLOAD_IMAGE_TEMP
  if (!fs.existsSync(uploadDir)) {
    console.log('Not found folder Upload, start create')
    fs.mkdirSync(uploadDir, { recursive: true })
  }
}

export const handleUploadSigleImage = async (req: Request) => {
  return new Promise<File>((resolve, reject) => {
    const form = formidable({
      uploadDir: UPLOAD_IMAGE_TEMP,
      keepExtensions: true,
      maxFiles: 1,
      maxFileSize: 30 * 1024 * 1024, // Giới hạn 30MB
      filter: ({ mimetype }) => {
        const isValidImage = mimetype && mimetype.startsWith('image/')
        if (!isValidImage) {
          form.emit('error' as any, new Error('invalid type') as any)
          // Chỉ chấp nhận file ảnh
          return false
        }
        return true
      }
    })

    // Bắt sự kiện error
    form.on('error', (err) => {
      console.error('Lỗi upload:', err.message)
      reject(err) // Reject promise để controller bắt được
    })

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
        return
      }

      // Kiểm tra xem có file nào được upload không
      if (!files.image) {
        reject(new Error('No image file uploaded'))
        return
      }

      resolve(files.image[0])
    })
  })
}
