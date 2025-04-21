export const validationMessages = {
  name: {
    required: 'Tên không được để trống',
    length: 'Tên phải có ít nhất 2 ký tự'
  },
  email: {
    required: 'Email không được để trống',
    invalid: 'Email không hợp lệ',
    exists: 'Email đã tồn tại',
    emalilNotFound: 'Không tìm thấy người dùng'
  },
  password: {
    required: 'Mật khẩu không được để trống',
    length: 'Mật khẩu phải có ít nhất 6 ký tự  và nhỏ hơn 50 kí tự',
    strong: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt'
  },
  confirmPassword: {
    required: 'Xác nhận mật khẩu không được để trống',
    mismatch: 'Mật khẩu xác nhận không khớp',
    length: 'Mật khẩu xác nhận phải có ít nhất 6 ký tự và nhỏ hơn 50 kí tự'
  },
  dateOfBirth: {
    required: 'Ngày sinh không được để trống',
    format: 'Ngày sinh phải đúng định dạng ISO8601 (YYYY-MM-DD)'
  },
  accessToken: {
    required: 'AccessToken required',
    Bearer: 'Access token must start with Bearer'
  },
  refreshToken: {
    required: 'RefreshToken required',
    invalid: 'RefreshToken invalid',
    notExits: 'RefeshToken used or do not exits'
  },
  verifyEmailToken: {
    required: 'Verify Email Token required',
    invalid: 'Verify Email Token invalid',
    verified: 'Email alrady verified',
    success: 'Email verify success',
    resendSuccess: 'Resend email success'
  },
  logout: {
    success: 'Logout Successfully'
  },
  user: {
    notFound: 'User not found',
    Found: 'Get user success'
  },
  forgotPassword: {
    sended: 'Check email to reset password',
    required: 'Forgot Password Token required',
    invalid: 'Forgot Password Token invalid',
    success: 'Forgot Password Token verify success',
    notExits: 'ForgotPassword token used or do not exits'
  },
  resetpassword: {
    success: 'Reset password success, login again !'
  }
}
