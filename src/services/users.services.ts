import User from '../models/schemas/users.schema'
import databaseService from './database.services'

class UserService {
  async register(payload: { email: string; password: string }) {
    const { email, password } = payload

    const result = await databaseService.users.insertOne(
      new User({
        email,
        password
      })
    )

    return result
  }
}

// 👇 Export object để sử dụng luôn mà không cần khởi tạo lại
const userService = new UserService()
export default userService
