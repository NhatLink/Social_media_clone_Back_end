import { Request, Response, NextFunction, RequestHandler } from 'express'

export const wrapAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next)
    } catch (error) {
      next(error)
    }
  }

  // Promise.resolve(fn(req, res, next)).catch(next)
  //}
  //try/catch using promise, but make sure func is async function
}

export const errorHandlerGlobal = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Đã xảy ra lỗi'
  })
}
