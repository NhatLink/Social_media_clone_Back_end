import { Request } from 'express'
import User from './models/schemas/users.schema'
import { TokenPayload } from './models/requests/users.requests'

declare module 'express' {
  interface Request {
    user?: User
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
  }
}
