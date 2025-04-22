import { NextFunction, Request, Response } from 'express'
import { body, checkSchema, ParamSchema } from 'express-validator'
import userService from '../services/users.services'
import { ErrorWithStatus } from '../models/Errors'
import { validationMessages } from '../constants/validationMessages '
import databaseService from '../services/database.services'
import { hashPassword } from '../units/crypto'
import { verifyToken } from '../units/jwt'
import httpStatus from '../constants/httpStatus'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize, result } from 'lodash'
import { ObjectId } from 'mongodb'
import { TokenPayload } from '../models/requests/users.requests'
import { UserVerifyStatus } from '../constants/enums'

//option khi có quá nhiều validator giống nhau
export const passwordValidatorSchema: ParamSchema = {
  notEmpty: {
    errorMessage: validationMessages.password.required
  },
  isLength: {
    options: { min: 6, max: 50 },
    errorMessage: validationMessages.password.length
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: validationMessages.password.strong
  }
}

export const confirmPasswordValidatorSchema: ParamSchema = {
  notEmpty: {
    errorMessage: validationMessages.confirmPassword.required
  },
  custom: {
    options: (value, { req }) => value === req.body.password,
    errorMessage: validationMessages.confirmPassword.mismatch
  },
  isLength: {
    options: { min: 6, max: 50 },
    errorMessage: validationMessages.confirmPassword.length
  }
}

export const verifyForgotPasswordTokenSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value: string, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: validationMessages.forgotPassword.required,
          status: httpStatus.NOT_FOUND
        })
      }
      try {
        const decoded_forgot_password_token = await verifyToken({
          token: value,
          secretOrPublicKey: process.env.JWT_KEY_FORGOT_PASSWORD_VERIFY_TOKEN as string
        })
        const { user_id } = decoded_forgot_password_token
        const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
        if (!user) {
          throw new ErrorWithStatus({
            message: validationMessages.user.notFound,
            status: httpStatus.UNAUTHORIZED
          })
        }
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({
            message: capitalize(error.message),
            status: httpStatus.UNAUTHORIZED
          })
        } else {
          throw error
        }
      }
      return true
    }
  }
}

export const loginValidator = checkSchema(
  {
    email: {
      notEmpty: {
        errorMessage: validationMessages.email.required
      },
      isEmail: {
        errorMessage: validationMessages.email.invalid
      },
      normalizeEmail: true,
      custom: {
        options: async (value, { req }) => {
          const user = await databaseService.users.findOne({ email: value, password: hashPassword(req.body.password) })
          if (!user) {
            throw new Error(validationMessages.email.emalilNotFound)
          }
          req.user = user
          return true
        }
      }
    },

    password: {
      notEmpty: {
        errorMessage: validationMessages.password.required
      },
      isLength: {
        options: { min: 6, max: 50 },
        errorMessage: validationMessages.password.length
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minUppercase: 1,
          minLowercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage: validationMessages.password.strong
      }
    }
  },
  ['body']
)

export const registerValidation = checkSchema(
  {
    name: {
      notEmpty: {
        errorMessage: validationMessages.name.required
      },
      isLength: {
        options: { min: 2, max: 100 },
        errorMessage: validationMessages.name.length
      },
      trim: true,
      escape: true
    },

    email: {
      notEmpty: {
        errorMessage: validationMessages.email.required
      },
      isEmail: {
        errorMessage: validationMessages.email.invalid
      },
      normalizeEmail: true,
      custom: {
        options: async (value) => {
          const emailExists = await userService.checkEmailExists(value)
          if (emailExists) {
            throw new Error(validationMessages.email.exists)
          }
          return true
        }
      }
    },

    password: {
      notEmpty: {
        errorMessage: validationMessages.password.required
      },
      isLength: {
        options: { min: 6, max: 50 },
        errorMessage: validationMessages.password.length
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minUppercase: 1,
          minLowercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage: validationMessages.password.strong
      }
    },

    confirm_password: {
      notEmpty: {
        errorMessage: validationMessages.confirmPassword.required
      },
      custom: {
        options: (value, { req }) => value === req.body.password,
        errorMessage: validationMessages.confirmPassword.mismatch
      },
      isLength: {
        options: { min: 6, max: 50 },
        errorMessage: validationMessages.confirmPassword.length
      }
    },

    date_of_birth: {
      notEmpty: {
        errorMessage: validationMessages.dateOfBirth.required
      },
      isISO8601: {
        options: { strict: true, strictSeparator: true },
        errorMessage: validationMessages.dateOfBirth.format
      },
      toDate: true
    }
  },
  ['body']
)

export const accessTokenValidate = checkSchema(
  {
    Authorization: {
      in: ['headers'],
      // notEmpty: {
      //   errorMessage: validationMessages.accessToken.required
      // },
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          if (!value) {
            throw new ErrorWithStatus({
              message: validationMessages.accessToken.required,
              status: httpStatus.UNAUTHORIZED
            })
          }
          const accessToken = value.split(' ')[1]
          if (!accessToken) {
            throw new ErrorWithStatus({
              message: validationMessages.accessToken.required,
              status: httpStatus.UNAUTHORIZED
            })
          }
          try {
            const decoded_authorization = await verifyToken({
              token: accessToken,
              secretOrPublicKey: process.env.JWT_KEY_SECRET_ACCESS_TOKEN as string
            })
            ;(req as Request).decoded_authorization = decoded_authorization
          } catch (error) {
            if (error instanceof JsonWebTokenError) {
              throw new ErrorWithStatus({
                message: capitalize(error.message),
                status: httpStatus.UNAUTHORIZED
              })
            } else {
              throw error
            }
          }
          return true
        }
      }
    }
  },
  ['headers']
)

export const refreshTokenValidate = checkSchema({
  refresh_token: {
    // notEmpty: {
    //   errorMessage: validationMessages.refreshToken.required
    // },
    trim: true,
    custom: {
      options: async (value: string, { req }) => {
        if (!value) {
          throw new ErrorWithStatus({
            message: validationMessages.refreshToken.required,
            status: httpStatus.UNAUTHORIZED
          })
        }
        try {
          // const decoded_refresh_token = await verifyToken({ token: value })
          // const refresh_token_data = databaseService.refreshToken.findOne({ token: value })
          //cho vao promise.all
          const [decoded_refresh_token, refresh_token_data] = await Promise.all([
            verifyToken({ token: value, secretOrPublicKey: process.env.JWT_KEY_SECRET_REFRESH_TOKEN as string }),
            databaseService.refreshTokens.findOne({ token: value })
          ])
          if (refresh_token_data === null) {
            throw new ErrorWithStatus({
              message: validationMessages.refreshToken.notExits,
              status: httpStatus.UNAUTHORIZED
            })
          }
          ;(req as Request).decoded_refresh_token = decoded_refresh_token
        } catch (error) {
          if (error instanceof JsonWebTokenError) {
            throw new ErrorWithStatus({
              message: capitalize(error.message),
              status: httpStatus.UNAUTHORIZED
            })
          } else {
            throw error
          }
        }

        return true
      }

      // options: async (value: string, { req }) => {
      //   const [decoded, tokenDoc] = await Promise.all([
      //     verifyToken({ token: value }),
      //     databaseService.refreshTokens.findOne({ token: value })
      //   ])

      //   if (!tokenDoc) {
      //     throw new ErrorWithStatus({
      //       message: validationMessages.refreshToken.notExits,
      //       status: httpStatus.UNAUTHORIZED
      //     })
      //   }

      //   req.decoded_refresh_token = decoded
      //   return true
      // }
    }
  }
})

export const emailVerifyTokenValidate = checkSchema({
  email_verify_token: {
    trim: true,
    custom: {
      options: async (value: string, { req }) => {
        if (!value) {
          throw new ErrorWithStatus({
            message: validationMessages.verifyEmailToken.required,
            status: httpStatus.UNAUTHORIZED
          })
        }
        try {
          const decoded_email_verify_token = await verifyToken({
            token: value,
            secretOrPublicKey: process.env.JWT_KEY_SECRET_EMAIL_VERIFY_TOKEN as string
          })
          ;(req as Request).decoded_email_verify_token = decoded_email_verify_token
        } catch (error) {
          if (error instanceof JsonWebTokenError) {
            throw new ErrorWithStatus({
              message: capitalize(error.message),
              status: httpStatus.UNAUTHORIZED
            })
          } else {
            throw error
          }
        }
        return true
      }
    }
  }
})

export const forgotPasswordValidator = checkSchema(
  {
    email: {
      notEmpty: {
        errorMessage: validationMessages.email.required
      },
      isEmail: {
        errorMessage: validationMessages.email.invalid
      },
      normalizeEmail: true,
      custom: {
        options: async (value, { req }) => {
          const user = await databaseService.users.findOne({ email: value })
          if (!user) {
            throw new Error(validationMessages.email.emalilNotFound)
          }
          req.user = user
          return true
        }
      }
    }
  },
  ['body']
)

//cách này thì mình sẽ kiểm tra và verify ngay tại middleware luôn, không phải lưu decoded qua req và verify user_id ngay tại controller nữa
export const verifyForgotPasswordTokenValidator = checkSchema({
  forgot_password_token: {
    trim: true,
    custom: {
      options: async (value: string, { req }) => {
        if (!value) {
          throw new ErrorWithStatus({
            message: validationMessages.forgotPassword.required,
            status: httpStatus.NOT_FOUND
          })
        }
        try {
          const decoded_forgot_password_token = await verifyToken({
            token: value,
            secretOrPublicKey: process.env.JWT_KEY_FORGOT_PASSWORD_VERIFY_TOKEN as string
          })
          const { user_id } = decoded_forgot_password_token
          const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
          if (!user) {
            throw new ErrorWithStatus({
              message: validationMessages.user.notFound,
              status: httpStatus.UNAUTHORIZED
            })
          }
        } catch (error) {
          if (error instanceof JsonWebTokenError) {
            throw new ErrorWithStatus({
              message: capitalize(error.message),
              status: httpStatus.UNAUTHORIZED
            })
          } else {
            throw error
          }
        }
        return true
      }
    }
  }
})

export const resetPasswordValidator = checkSchema({
  forgot_password_token: {
    trim: true,
    custom: {
      options: async (value: string, { req }) => {
        if (!value) {
          throw new ErrorWithStatus({
            message: validationMessages.forgotPassword.required,
            status: httpStatus.NOT_FOUND
          })
        }
        try {
          const decoded_forgot_password_token = await verifyToken({
            token: value,
            secretOrPublicKey: process.env.JWT_KEY_FORGOT_PASSWORD_VERIFY_TOKEN as string
          })
          const { user_id } = decoded_forgot_password_token
          ;(req as Request).decoded_forgot_password_token = decoded_forgot_password_token
          const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
          if (!user) {
            throw new ErrorWithStatus({
              message: validationMessages.user.notFound,
              status: httpStatus.UNAUTHORIZED
            })
          }
          if (user.forgot_password_token !== value) {
            throw new ErrorWithStatus({
              message: validationMessages.forgotPassword.notExits,
              status: httpStatus.UNAUTHORIZED
            })
          }
        } catch (error) {
          if (error instanceof JsonWebTokenError) {
            throw new ErrorWithStatus({
              message: capitalize(error.message),
              status: httpStatus.UNAUTHORIZED
            })
          } else {
            throw error
          }
        }
        return true
      }
    }
  },
  password: passwordValidatorSchema,
  confirm_password: {
    notEmpty: {
      errorMessage: validationMessages.confirmPassword.required
    },
    custom: {
      options: (value, { req }) => value === req.body.password,
      errorMessage: validationMessages.confirmPassword.mismatch
    },
    isLength: {
      options: { min: 6, max: 50 },
      errorMessage: validationMessages.confirmPassword.length
    }
  }
})

export const verifiedUserValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { verify, user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (verify !== UserVerifyStatus.Verified) {
    return next(
      new ErrorWithStatus({
        message: validationMessages.user.notVerify,
        status: httpStatus.FORBIDDEN
      })
    )
  }
  if (!user) {
    return next(
      new ErrorWithStatus({
        message: validationMessages.user.notFound,
        status: httpStatus.NOT_FOUND
      })
    )
  }
  if (user?.verify !== UserVerifyStatus.Verified) {
    return next(
      new ErrorWithStatus({
        message: validationMessages.user.notVerify,
        status: httpStatus.FORBIDDEN
      })
    )
  }
  next()
}

//lưu vào messagevalidator sau
export const updateMeValidator = checkSchema({
  name: {
    optional: true,
    isLength: {
      options: { min: 2, max: 100 },
      errorMessage: validationMessages.name.length
    },
    trim: true,
    escape: true
  },
  date_of_birth: {
    optional: true,
    isISO8601: {
      options: { strict: true, strictSeparator: true },
      errorMessage: validationMessages.dateOfBirth.format
    },
    toDate: true
  },
  bio: {
    optional: true,
    isString: {
      errorMessage: 'Bio phải là một chuỗi kí tự'
    },
    isLength: {
      options: { min: 1, max: 100 },
      errorMessage: 'Bio trong khoảng 1 đến 200 kí tự'
    },
    trim: true,
    escape: true
  },
  location: {
    optional: true,
    isString: {
      errorMessage: 'Vị trí phải là một chuỗi kí tự'
    },
    isLength: {
      options: { min: 1, max: 100 },
      errorMessage: 'Vị trí chỉ trong khoảng 1 đến 200 kí tự'
    },
    trim: true,
    escape: true
  },
  website: {
    optional: true,
    isURL: {
      errorMessage: 'Địa chỉ website không hợp lệ'
    },
    isLength: {
      options: { min: 1, max: 100 },
      errorMessage: 'Địa chỉ website chỉ trong khoảng 1 đến 200 kí tự'
    },
    trim: true,
    escape: true
  },
  username: {
    optional: true,
    isLength: {
      options: { min: 3, max: 30 },
      errorMessage: 'Tên người dùng phải từ 3 đến 30 ký tự'
    },
    matches: {
      options: [/^[a-zA-Z0-9_]+$/],
      errorMessage: 'Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới'
    },
    custom: {
      options: async (value) => {
        const user = await databaseService.users.findOne({ username: value })
        if (user) {
          throw new ErrorWithStatus({
            message: 'username already exits',
            status: httpStatus.BAD_REQUEST
          })
        }
        return true
      }
    },
    trim: true,
    escape: true
  },
  avatar: {
    optional: true,
    isString: {
      errorMessage: 'Avartar phải là một chuỗi kí tự'
    },
    isLength: {
      options: { min: 1, max: 100 },
      errorMessage: 'Avatar chỉ trong khoảng 1 đến 200 kí tự'
    },
    trim: true,
    escape: true
  },
  cover_photo: {
    optional: true,
    isString: {
      errorMessage: 'Cover_photo phải là một chuỗi kí tự'
    },
    isLength: {
      options: { min: 1, max: 100 },
      errorMessage: 'Cover_photo chỉ trong khoảng 1 đến 200 kí tự'
    },
    trim: true,
    escape: true
  }
})

export const followValidator = checkSchema({
  follow_user_id: {
    notEmpty: {
      errorMessage: validationMessages.followers.followerEmpty
    },
    isString: {
      errorMessage: validationMessages.followers.followerNotString
    },
    custom: {
      options: async (value) => {
        // Kiểm tra ObjectId hợp lệ
        if (!ObjectId.isValid(value)) {
          throw new Error(validationMessages.followers.followerInvalidId)
        }
        return true
      }
    },
    trim: true,
    escape: true
  }
})
