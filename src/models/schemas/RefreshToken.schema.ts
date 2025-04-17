import { ObjectId } from 'mongodb'

interface RefreshTokenType {
  _id?: ObjectId // Có thể không có, vì MongoDB sẽ tự tạo
  token: string
  created_at?: Date
  user_id: ObjectId
}

export default class RefreshToken {
  _id?: ObjectId // Có thể không có, vì MongoDB sẽ tự tạo
  token: string
  created_at: Date
  user_id: ObjectId

  constructor(user: RefreshTokenType) {
    this._id = user._id
    this.token = user.token
    this.created_at = user.created_at || new Date()
    this.user_id = user.user_id
  }
}
