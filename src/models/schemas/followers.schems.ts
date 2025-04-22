import { ObjectId } from 'mongodb'

interface FollowersType {
  _id?: ObjectId // Có thể không có, vì MongoDB sẽ tự tạo
  user_id: ObjectId
  followed_user_id: ObjectId
  created_at?: Date
}

export default class Followers {
  _id?: ObjectId // Có thể không có, vì MongoDB sẽ tự tạo
  user_id: ObjectId
  followed_user_id: ObjectId
  created_at: Date

  constructor(user: FollowersType) {
    this._id = user._id
    this.followed_user_id = user.followed_user_id
    this.created_at = user.created_at || new Date()
    this.user_id = user.user_id
  }
}
