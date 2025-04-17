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
  }
}
