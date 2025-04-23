import { ObjectId } from 'mongodb'
import { TokenType, UserVerifyStatus } from '../constants/enums'
import { RegisterReqBody, UpdateMeReqBody } from '../models/requests/users.requests'
import RefreshToken from '../models/schemas/RefreshToken.schema'
import User from '../models/schemas/users.schema'
import { hashPassword } from '../units/crypto'
import { signToken } from '../units/jwt'
import databaseService from './database.services'
import { validationMessages } from '../constants/validationMessages '
import { config } from 'dotenv'
import type { StringValue } from 'ms'
import { ErrorWithStatus } from '../models/Errors'
import httpStatus from '../constants/httpStatus'
import Followers from '../models/schemas/followers.schems'
config()
class UserService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.Accesstoken,
        verify
      },
      privatekey: process.env.JWT_KEY_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: '15m'
      }
    })
  }
  private signRefershToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefeshToken,
        verify
      },
      privatekey: process.env.JWT_KEY_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: '30d'
      }
    })
  }
  private emailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
        verify
      },
      privatekey: process.env.JWT_KEY_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: '7d'
      }
    })
  }
  private forgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
        verify
      },
      privatekey: process.env.JWT_KEY_FORGOT_PASSWORD_VERIFY_TOKEN as string,
      options: {
        expiresIn: '7d'
      }
    })
  }
  private signRefershTokenAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefershToken({ user_id, verify })])
  }
  async register(payload: RegisterReqBody) {
    // const { name, email, password, date_of_birth } = payload
    const user_id = new ObjectId()
    const email_verify_token = await this.emailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    console.log('email_verify_token:', email_verify_token)

    await databaseService.users.insertOne(
      new User({
        _id: user_id,
        ...payload,
        username: `user${user_id.toString()}`,
        email_verify_token,
        password: hashPassword(payload.password)
      })
    )
    const [access_token, refresh_token] = await this.signRefershTokenAccessToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await databaseService.refreshTokens.insertOne(new RefreshToken({ token: refresh_token, user_id: user_id }))
    return {
      access_token,
      refresh_token
    }
  }
  async checkEmailExists(email: string) {
    const user = await databaseService.users.findOne({ email })
    return user !== null // Trả về true nếu tìm thấy user với email này
  }
  async login(user_id: string, verify: UserVerifyStatus) {
    const [access_token, refresh_token] = await this.signRefershTokenAccessToken({
      user_id: user_id.toString(),
      verify: verify
    })
    const id = new ObjectId(user_id) //chuyen string thanh objectID
    await databaseService.refreshTokens.insertOne(new RefreshToken({ token: refresh_token, user_id: id }))
    return {
      access_token,
      refresh_token
    }
  }
  async logout(refresh_token: string) {
    const result = await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: validationMessages.logout.success
    }
  }

  async verifyEmail(user_id: string) {
    // const result = await databaseService.users.updateOne(
    //   { _id: new ObjectId(user_id) },
    //   {
    //     $set: {
    //       email_verify_token: '',
    //       updated_at: new Date()
    //     }
    //   }
    // )

    //gop vao chung promise
    const [token] = await Promise.all([
      this.signRefershTokenAccessToken({ user_id: user_id, verify: UserVerifyStatus.Verified }),
      databaseService.users.updateOne(
        { _id: new ObjectId(user_id) },
        {
          $set: {
            email_verify_token: '',
            verify: UserVerifyStatus.Verified
            // updated_at:'$$NOW'
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
    ])
    const [access_token, refresh_token] = token
    return {
      access_token,
      refresh_token
    }
  }
  async resendVerifyEmail(user_id: string) {
    const resend_email_verify_token = await this.emailVerifyToken({
      user_id: user_id,
      verify: UserVerifyStatus.Unverified
    })
    console.log('resend_email_verify_token:', resend_email_verify_token)

    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          email_verify_token: resend_email_verify_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: validationMessages.verifyEmailToken.resendSuccess
    }
  }
  async forgotPassword(user_id: string, verify: UserVerifyStatus) {
    const forgot_password_token = await this.forgotPasswordToken({ user_id: user_id, verify: verify })
    databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          forgot_password_token: forgot_password_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    //send email with link https/website/token=forgot_password_token
    console.log('forgot_password_token', forgot_password_token)
    return {
      message: validationMessages.forgotPassword.sended
    }
  }

  async resetpassword(user_id: string, password: string) {
    databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          forgot_password_token: '',
          password: hashPassword(password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: validationMessages.resetpassword.success
    }
  }
  async getMe(user_id: string) {
    const result = databaseService.users.findOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        projection: {
          //sử dụng projection khi muốn ẩn 1 số thông tin nhạy cảm trong data
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return result
  }
  async updateMe(user_id: string, bodyPayLoad: UpdateMeReqBody) {
    // if (typeof bodyPayLoad.date_of_birth === 'string') {
    //   bodyPayLoad.date_of_birth = new Date(bodyPayLoad.date_of_birth)
    // }
    const result = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          ...bodyPayLoad
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        projection: {
          //sử dụng projection khi muốn ẩn 1 số thông tin nhạy cảm trong data
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        },
        returnDocument: 'after'
      }
    )
    return result
  }
  async getUserProfile(username: string) {
    const user = await databaseService.users.findOne(
      {
        username: username
      },
      {
        projection: {
          //sử dụng projection khi muốn ẩn 1 số thông tin nhạy cảm trong data
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          created_at: 0,
          updated_at: 0,
          verify: 0
        }
      }
    )
    if (user === null) {
      throw new ErrorWithStatus({
        message: validationMessages.user.notFound,
        status: httpStatus.NOT_FOUND
      })
    }
    return user
  }

  async followUser(follow_user_id: string, user_id: string) {
    const id = new ObjectId(user_id) //chuyen string thanh objectID
    const follower_id = new ObjectId(follow_user_id)
    const followedUser = await databaseService.users.findOne({ _id: follower_id })
    if (user_id === follow_user_id) {
      throw new ErrorWithStatus({
        status: httpStatus.BAD_REQUEST,
        message: validationMessages.followers.notExits
      })
    }
    if (!followedUser) {
      throw new ErrorWithStatus({
        status: httpStatus.BAD_REQUEST,
        message: validationMessages.followers.notExits
      })
    }

    // Có thể kiểm tra thêm nếu đã follow rồi thì không cho follow lại:
    const alreadyFollowed = await databaseService.followers.findOne({
      followed_user_id: follower_id,
      user_id: id
    })

    if (alreadyFollowed) {
      throw new ErrorWithStatus({
        status: httpStatus.BAD_REQUEST,
        message: validationMessages.followers.alreadyFollow
      })
    }
    const result = await databaseService.followers.insertOne(
      new Followers({ followed_user_id: follower_id, user_id: id })
    )
    return {
      result
    }
  }

  async unfollowUser(follow_user_id: string, user_id: string) {
    const id = new ObjectId(user_id)
    const follower_id = new ObjectId(follow_user_id)

    if (user_id === follow_user_id) {
      throw new ErrorWithStatus({
        status: httpStatus.BAD_REQUEST,
        message: validationMessages.followers.notExits
      })
    }

    const followedUser = await databaseService.users.findOne({ _id: follower_id })

    if (!followedUser) {
      throw new ErrorWithStatus({
        status: httpStatus.BAD_REQUEST,
        message: validationMessages.followers.notExits
      })
    }

    const alreadyFollowed = await databaseService.followers.findOne({
      followed_user_id: follower_id,
      user_id: id
    })

    if (!alreadyFollowed) {
      throw new ErrorWithStatus({
        status: httpStatus.BAD_REQUEST,
        message: validationMessages.followers.notFollowYet
      })
    }

    const result = await databaseService.followers.deleteOne({
      followed_user_id: follower_id,
      user_id: id
    })

    return {
      result
    }
  }

  async changePassword(new_password: string, user_id: string) {
    const result = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          password: hashPassword(new_password)
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        projection: {
          //sử dụng projection khi muốn ẩn 1 số thông tin nhạy cảm trong data
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        },
        returnDocument: 'after'
      }
    )
    return {
      result
    }
  }
}

// Export object để sử dụng luôn mà không cần khởi tạo lại
const userService = new UserService()
export default userService
