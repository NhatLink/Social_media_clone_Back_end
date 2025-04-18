import jwt, { JsonWebTokenError, JwtPayload, SignOptions, TokenExpiredError } from 'jsonwebtoken'
import { config } from 'dotenv'
import { ErrorWithStatus } from '../models/Errors'
import httpStatus from '../constants/httpStatus'
import { TokenPayload } from '../models/requests/users.requests'
config()
export const signToken = ({
  payload,
  privatekey,
  options = {
    algorithm: 'HS256'
  }
}: {
  payload: string | Buffer | object
  privatekey: string
  options?: SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privatekey, options, (error, token) => {
      if (error) {
        throw reject(error)
      }
      resolve(token as string)
    })
  })
}

export const verifyToken = ({ token, secretOrPublicKey }: { token: string; secretOrPublicKey: string }) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (error, decoded) => {
      if (error) {
        return reject(error)
      }
      resolve(decoded as TokenPayload)
    })
  })
}
// export const verifyToken = ({
//   token,
//   secretOrPublicKey = process.env.JWT_KEY_SECRET as string
// }: {
//   token: string
//   secretOrPublicKey?: string
// }) => {
//   return new Promise<JwtPayload>((resolve, reject) => {
//     jwt.verify(token, secretOrPublicKey, (error, decoded) => {
//       if (error) {
//         if (error instanceof TokenExpiredError) {
//           return reject(
//             new ErrorWithStatus({
//               message: 'jwt expired',
//               status: httpStatus.UNAUTHORIZED
//             })
//           )
//         }

//         if (error instanceof JsonWebTokenError) {
//           return reject(
//             new ErrorWithStatus({
//               message: 'Invalid token',
//               status: httpStatus.UNAUTHORIZED
//             })
//           )
//         }

//         // fallback: lỗi JWT không xác định
//         return reject(
//           new ErrorWithStatus({
//             message: 'Token error',
//             status: httpStatus.UNAUTHORIZED
//           })
//         )
//       }

//       resolve(decoded as JwtPayload)
//     })
//   })
// }

// signToken({
//   payload: {},
//   privatekey,
//   options: {
//     algorithm: 'HS256'
//   }
// })
