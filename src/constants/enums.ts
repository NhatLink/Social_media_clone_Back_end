export enum UserVerifyStatus {
  Unverified, // 0 - chưa xác thực email
  Verified, // 1 - đã xác thực email
  Banned // 2 - bị khóa
}

export enum TokenType {
  Accesstoken,
  RefeshToken,
  ForgotPasswordToken
}
