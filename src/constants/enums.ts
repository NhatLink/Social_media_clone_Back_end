export enum UserVerifyStatus {
  Unverified, // 0 - chưa xác thực email
  Verified, // 1 - đã xác thực email
  Banned // 2 - bị khóa
}

export enum TokenType {
  Accesstoken,
  RefeshToken,
  EmailVerifyToken,
  ForgotPasswordToken
}

export enum MediaType {
  Image,
  Video
}

export const VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/quicktime', // .mov
  'video/x-msvideo', // .avi
  'video/x-matroska', // .mkv
  'video/webm'
]
