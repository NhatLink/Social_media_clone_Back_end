import express from 'express'
import { body, validationResult, ContextRunner } from 'express-validator'
import { EntityError, ErrorWithStatus } from '../models/Errors'
import httpStatus from '../constants/httpStatus'

// can be reused by many routes
// const validate = (validations: ContextRunner[]) => {
//   return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
//     const entityError = new EntityError({ errors: {} })
//     for (const validation of validations) {
//       const result = await validation.run(req)
//       const errorsObject = result.mapped()
//       for (const key in errorsObject) {
//         const { msg } = errorsObject[key]
//         if (msg instanceof ErrorWithStatus && msg.status !== httpStatus.UNPROCESSABLE_ENTITY) {
//           return next(msg)
//         }
//         entityError.errors[key] = errorsObject[key]
//       }
//     }
//     // Nếu có lỗi 422 thì trả về
//     if (Object.keys(entityError.errors).length > 0) {
//       return next(entityError)
//     }

//     // Nếu không có lỗi thì đi tiếp
//     return next()
//   }
// }

const validate = (validations: ContextRunner[]) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)))
    const errorsResult = validationResult(req)
    const errorsObject = errorsResult.mapped()
    const entityError = new EntityError({ errors: {} })

    for (const key in errorsObject) {
      const { msg } = errorsObject[key]
      // Nếu có lỗi không phải 422 (validation), trả về luôn
      if (msg instanceof ErrorWithStatus && msg.status !== httpStatus.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }
      // Gom lỗi 422 vào entityError
      entityError.errors[key] = errorsObject[key]
    }
    if (!errorsResult.isEmpty()) {
      return next(entityError)
    }

    return next()
  }
}

export default validate
