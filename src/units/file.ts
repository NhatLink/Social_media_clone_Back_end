import fs from 'fs'
import path from 'path'
import { UPLOAD_IMAGE, UPLOAD_IMAGE_TEMP, UPLOAD_VIDEO, UPLOAD_VIDEO_TEMP } from '../constants/dir'
import formidable, { File } from 'formidable'
import { Request } from 'express'
import { VIDEO_MIME_TYPES } from '../constants/enums'

export const ensureUploadDir = () => {
  const directories = [UPLOAD_IMAGE_TEMP, UPLOAD_VIDEO_TEMP, UPLOAD_IMAGE, UPLOAD_VIDEO]

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true })
        console.log(`Created directory: ${dir}`)
      } catch (err) {
        console.error(`Failed to create directory ${dir}:`, err)
        throw err // Dừng ứng dụng nếu không tạo được thư mục quan trọng
      }
    }
  })
}

export const handleUploadImages = async (req: Request) => {
  return new Promise<File[]>((resolve, reject) => {
    const form = formidable({
      uploadDir: UPLOAD_IMAGE_TEMP,
      keepExtensions: true,
      maxFiles: 10, // Tăng số lượng file tối đa có thể upload
      maxFileSize: 30 * 1024 * 1024, // Giới hạn 30MB mỗi file
      filter: ({ mimetype }) => {
        const isValidImage = mimetype && mimetype.startsWith('image/')
        if (!isValidImage) {
          form.emit('error' as any, new Error('invalid type') as any)
          return false
        }
        return true
      }
    })

    form.on('error', (err) => {
      console.error('Lỗi upload:', err.message)
      reject(err)
    })

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
        return
      }

      // Kiểm tra xem có file nào được upload không
      if (!files.image || files.image.length === 0) {
        reject(new Error('No image files uploaded'))
        return
      }

      resolve(files.image) // Trả về mảng các file
    })
  })
}

export const handleUploadVideo = async (req: Request) => {
  return new Promise<File[]>((resolve, reject) => {
    const form = formidable({
      uploadDir: UPLOAD_VIDEO_TEMP,
      maxFiles: 5, // Giới hạn số video mỗi lần upload
      maxFileSize: 50 * 1024 * 1024, // 500MB
      filter: ({ mimetype }) => {
        if (!mimetype || !VIDEO_MIME_TYPES.includes(mimetype)) {
          form.emit('error' as any, new Error('Invalid video format') as any)
          return false
        }
        return true
      }
    })

    form.parse(req, (err, _, files) => {
      if (err) reject(err)
      if (!files.video) reject(new Error('No video uploaded'))
      resolve(files.video as formidable.File[])
    })
  })
}
