import jwt, { SignOptions } from 'jsonwebtoken'
import { config } from 'dotenv'
config()
export const signToken = ({
  payload,
  privatekey = process.env.JWT_KEY_SECRET as string,
  options = {
    algorithm: 'HS256'
  }
}: {
  payload: string | Buffer | object
  privatekey?: string
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

signToken({
  payload: {},
  options: {
    algorithm: 'HS256'
  }
})
