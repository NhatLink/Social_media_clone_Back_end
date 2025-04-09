import { Request, Response } from 'express'
import databaseService from '../services/database.services'
import User from '../models/schemas/users.schema'
import userService from '../services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '../models/schemas/requests/users.requests'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'nhatlinh@gmail.com' && password === '123456') {
    res.status(200).json({
      message: 'Login success'
    })
    return
  }
  res.status(400).json({
    error: 'Login failed'
  })
  return
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await userService.register(req.body)
  res.status(200).json({
    message: 'User registered successfully',
    result
  })
  return
}
