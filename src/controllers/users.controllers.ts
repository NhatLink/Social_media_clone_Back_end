import { Request, Response } from 'express'
import userService from '../services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { LogoutReqBody, RegisterReqBody } from '../models/requests/users.requests'
import User from '../models/schemas/users.schema'
import { ObjectId } from 'mongodb'

export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await userService.login(user_id.toString())
  res.status(200).json({
    message: 'Login successfully',
    result
  })
  return
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await userService.register(req.body)
  res.status(200).json({
    message: 'Registered successfully',
    result
  })
  return
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await userService.logout(refresh_token)
  res.status(200).json({
    result
  })
}
