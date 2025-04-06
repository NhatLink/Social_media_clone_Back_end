import express from 'express'
import { body, validationResult, ContextRunner } from 'express-validator'

// can be reused by many routes
const validate = (validations: ContextRunner[]) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // sequential processing, stops running validations chain if one fails.
    for (const validation of validations) {
      const result = await validation.run(req)
      if (!result.isEmpty()) {
        res.status(400).json({ errors: result.array() })
        return
      }
    }

    next()
  }
}

export default validate
