import { NextFunction, Request, Response } from 'express'
import { pick, omitBy, isUndefined } from 'lodash'

export const fillterMiddleWare =
  <T>(filterKeys: (keyof T)[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.body = omitBy(pick(req.body, filterKeys), isUndefined)
    next()
  }

// Sử dụng Function declaration
//   export function filterMiddleware<T>(filterKeys: (keyof T)[]) {
//     return (req: Request, res: Response, next: NextFunction) => {
//       req.body = omitBy(pick(req.body, filterKeys), isUndefined)
//       next()
//     }
//   }
