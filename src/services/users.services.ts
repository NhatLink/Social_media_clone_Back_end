import { ObjectId } from 'mongodb'
import { TokenType, UserVerifyStatus } from '../constants/enums'
import { RegisterReqBody } from '../models/requests/users.requests'
import RefreshToken from '../models/schemas/RefreshToken.schema'
import User from '../models/schemas/users.schema'
import { hashPassword } from '../units/crypto'
import { signToken } from '../units/jwt'
import databaseService from './database.services'
import { validationMessages } from '../constants/validationMessages '
import { config } from 'dotenv'
import type { StringValue } from 'ms'
config()
class UserService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.Accesstoken
      },
      privatekey: process.env.JWT_KEY_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: '15m'
      }
    })
  }
  private signRefershToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefeshToken
      },
      privatekey: process.env.JWT_KEY_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: '30d'
      }
    })
  }
  private emailVerifyToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken
      },
      privatekey: process.env.JWT_KEY_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: '7d'
      }
    })
  }
  private signRefershTokenAccessToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefershToken(user_id)])
  }
  async register(payload: RegisterReqBody) {
    // const { name, email, password, date_of_birth } = payload
    const user_id = new ObjectId()
    const email_verify_token = await this.emailVerifyToken(user_id.toString())
    console.log('email_verify_token:', email_verify_token)

    await databaseService.users.insertOne(
      new User({
        _id: user_id,
        ...payload,
        email_verify_token,
        password: hashPassword(payload.password)
      })
    )
    const [access_token, refresh_token] = await this.signRefershTokenAccessToken(user_id.toString())
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
  async login(user_id: string) {
    const [access_token, refresh_token] = await this.signRefershTokenAccessToken(user_id)
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
      this.signRefershTokenAccessToken(user_id),
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
    const resend_email_verify_token = await this.emailVerifyToken(user_id)
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
}

// Export object để sử dụng luôn mà không cần khởi tạo lại
const userService = new UserService()
export default userService
