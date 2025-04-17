import { Request, Response, NextFunction } from 'express'
import httpStatus from '../constants/httpStatus'
import { omit } from 'lodash'
import { ErrorWithStatus } from '../models/Errors'

export const errorHandlerDefault = (err: any, req: Request, res: Response, next: NextFunction) => {
  // console.error('Error:', err.message)
  if (err instanceof ErrorWithStatus) {
    res.status(err.status).json(omit(err, ['status']))
    return
  }
  // //giúp hiển thị message, stack, name khi JSON.stringify(err)
  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, {
      enumerable: true
    })
  })
  res.status(err.status || httpStatus.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    errInfor: omit(err, ['stack'])
  })
  // res.status(err.status || httpStatus.INTERNAL_SERVER_ERROR).json({
  //   message: err.message,
  //   errInfor: omit(err, ['stack'])
  // })
}
