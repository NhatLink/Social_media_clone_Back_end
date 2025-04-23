import { Request, Response } from 'express'
import userService from '../services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  changePasswordReqBody,
  followUserReqBody,
  forgotPasswordReqBody,
  LoginReqBody,
  LogoutReqBody,
  RegisterReqBody,
  resestPasswordReqBody,
  TokenPayload,
  UpdateMeReqBody,
  VerifyEmailReqBody,
  verifyForgotPasswordTokenReqBody
} from '../models/requests/users.requests'
import User from '../models/schemas/users.schema'
import { ObjectId } from 'mongodb'
import databaseService from '../services/database.services'
import httpStatus, { userMessages } from '../constants/httpStatus'
import { validationMessages } from '../constants/validationMessages '
import { UserVerifyStatus } from '../constants/enums'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await userService.login(user_id.toString(), user.verify)
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
  return
}

export const emailVerifyController = async (req: Request<ParamsDictionary, any, VerifyEmailReqBody>, res: Response) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    res.status(httpStatus.NOT_FOUND).json({
      message: validationMessages.user.notFound
    })
    return
  }
  if (user.email_verify_token === '') {
    res.status(httpStatus.OK).json({
      message: validationMessages.verifyEmailToken.verified
    })
    return
  }
  const result = await userService.verifyEmail(user_id)
  res.status(200).json({
    result
  })
  return
}

//Không sài body nên không set kiểu cho body
export const resendEmailVerifyController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    res.status(httpStatus.NOT_FOUND).json({
      message: validationMessages.user.notFound
    })
    return
  }
  if (user?.verify === UserVerifyStatus.Verified) {
    res.json({
      message: validationMessages.verifyEmailToken.verified
    })
    return
  }
  const result = await userService.resendVerifyEmail(user_id)
  res.json({
    result
  })
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, forgotPasswordReqBody>,
  res: Response
) => {
  const { _id, verify } = req.user as User
  const result = await userService.forgotPassword((_id as ObjectId).toString(), verify)
  res.json({
    result
  })
}

export const verifyForgotPasswordTokenController = async (
  req: Request<ParamsDictionary, any, verifyForgotPasswordTokenReqBody>,
  res: Response
) => {
  res.json({
    message: validationMessages.forgotPassword.success
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, resestPasswordReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body
  const result = await userService.resetpassword(user_id, password)
  res.json({
    result
  })
}

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await userService.getMe(user_id)
  res.json({
    message: validationMessages.user.Found,
    result
  })
}

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  const result = await userService.updateMe(user_id, body)
  res.json({
    message: validationMessages.user.updateSuccess,
    result
  })
}

export const getUserProfile = async (req: Request, res: Response) => {
  const { username } = req.params
  const result = await userService.getUserProfile(username)
  res.json({
    message: validationMessages.user.Found,
    result
  })
}

export const followUserController = async (req: Request<ParamsDictionary, any, followUserReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { follow_user_id } = req.body
  const result = await userService.followUser(follow_user_id, user_id)
  res.json({
    message: validationMessages.followers.successsFollow,
    result
  })
}

export const unfollowUserController = async (req: Request<ParamsDictionary, any, followUserReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { follow_user_id } = req.body
  const result = await userService.unfollowUser(follow_user_id, user_id)
  res.json({
    message: validationMessages.followers.unfollowSuccess,
    result
  })
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, changePasswordReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { new_password } = req.body
  const result = await userService.changePassword(new_password, user_id)
  res.json({
    message: validationMessages.password.changeSuccess,
    result
  })
}
