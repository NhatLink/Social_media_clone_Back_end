import { NextFunction, Request, Response } from 'express'
import formidable, { File } from 'formidable'
import path from 'path'
import { UPLOAD_IMAGE, UPLOAD_IMAGE_TEMP } from '../constants/dir'
import { handleUploadSigleImage } from '../units/file'
import mediasService from '../services/medias.service'
import { validationMessages } from '../constants/validationMessages '

export const uploadOneImageController = async (req: Request, res: Response, next: NextFunction) => {
  // const payload: formidable.Options = {
  //   uploadDir: './uploads',
  //   keepExtensions: true,
  //   maxFiles: 1,
  //   maxFileSize: 30 * 1024 * 1024 // Giới hạn 30MB
  // }
  const result = await mediasService.handleUploadSingleImage(req)
  res.json({ message: validationMessages.uploadImg.success, result })
}

export const serverImageController = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_IMAGE, name), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found img')
    }
  })
}
