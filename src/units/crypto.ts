// src/utils/hash.utils.ts
import crypto from 'crypto'
import { createHash } from 'node:crypto'

// export const hashPassword = (password: string): string => {
//   return crypto.createHash('sha256').update(password).digest('hex')
// }

function sha256(content: string) {
  return createHash('sha256').update(content).digest('hex')
}

export const hashPassword = (password: string) => {
  return sha256(password + process.env.PASSWORD_CRYPTO)
}
