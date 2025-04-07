import { TokenType } from '../constants/enums'
import { RegisterReqBody } from '../models/schemas/requests/users.requests'
import User from '../models/schemas/users.schema'
import { hashPassword } from '../units/crypto'
import { signToken } from '../units/jwt'
import databaseService from './database.services'

class UserService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.Accesstoken
      },
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
      options: {
        expiresIn: '30d'
      }
    })
  }
  async register(payload: RegisterReqBody) {
    // const { name, email, password, date_of_birth } = payload

    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        password: hashPassword(payload.password)
      })
    )
    const user_id = result.insertedId.toString()
    const [access_token, refesh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefershToken(user_id)
    ])

    return {
      result,
      access_token,
      refesh_token
    }
  }
  async checkEmailExists(email: string) {
    const user = await databaseService.users.findOne({ email })
    return user !== null // Trả về true nếu tìm thấy user với email này
  }
}

// 👇 Export object để sử dụng luôn mà không cần khởi tạo lại
const userService = new UserService()
export default userService
