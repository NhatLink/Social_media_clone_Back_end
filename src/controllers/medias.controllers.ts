import { NextFunction, Request, Response } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import path from 'path'
import { UPLOAD_IMAGE, UPLOAD_IMAGE_TEMP, UPLOAD_VIDEO } from '../constants/dir'
import mediasService from '../services/medias.service'
import { validationMessages } from '../constants/validationMessages '

export const uploadImagesController = async (req: Request, res: Response, next: NextFunction) => {
  const results = await mediasService.uploadImages(req)
  res.json({
    message: validationMessages.uploadImg.success,
    results
  })
}

export const serverImageController = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_IMAGE, name), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found img')
    }
  })
}

export const serverVideoController = async (req: Request, res: Response) => {
  const { name } = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO, name)

  // Kiểm tra file tồn tại
  if (!fs.existsSync(videoPath)) {
    return res.status(404).send('Video not found')
  }

  const { size } = fs.statSync(videoPath)
  const range = req.headers.range

  // Xử lý range requests (cho phép stream từng phần)
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-')
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : size - 1
    const chunkSize = end - start + 1

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4'
    })

    const videoStream = fs.createReadStream(videoPath, { start, end })
    videoStream.pipe(res)
  } else {
    // Nếu không có range request, gửi toàn bộ file (không khuyến khích)
    res.writeHead(200, {
      'Content-Length': size,
      'Content-Type': 'video/mp4'
    })
    fs.createReadStream(videoPath).pipe(res)
  }
}

export const uploadVideoController = async (req: Request, res: Response) => {
  const results = await mediasService.uploadVideo(req)
  res.json({
    message: 'Upload video thành công',
    data: results
  })
}
