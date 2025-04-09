import { NextFunction, Request, Response } from 'express'
import httpStatus from '../constants/httpStatus'
import { omit } from 'lodash'

export const errorHandlerDefault = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message)
  res.status(err.status || httpStatus.INTERNAL_SERVER_ERROR).json(omit(err, ['status']))
}
