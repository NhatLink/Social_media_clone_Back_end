import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import userService from '../services/users.services'

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400).json({
      error: 'missing email or password!'
    })
    return
  }
  next()
}

export const registerValidation = checkSchema({
  name: {
    notEmpty: {
      errorMessage: 'Tên không được để trống'
    },
    isLength: {
      options: { min: 2, max: 100 },
      errorMessage: 'Tên phải có ít nhất 2 ký tự'
    },
    trim: true,
    escape: true
  },

  email: {
    notEmpty: {
      errorMessage: 'Email không được để trống'
    },
    isEmail: {
      errorMessage: 'Email không hợp lệ'
    },
    normalizeEmail: true,
    custom: {
      options: async (value) => {
        // Kiểm tra email đã tồn tại chưa
        const emailExists = await userService.checkEmailExists(value)
        if (emailExists) {
          throw new Error('Email này đã tồn tại')
        }
      }
    }
  },

  password: {
    notEmpty: {
      errorMessage: 'Mật khẩu không được để trống'
    },
    isLength: {
      options: { min: 6, max: 50 },
      errorMessage: 'Mật khẩu phải có ít nhất 6 ký tự  và nhỏ hơn 50 kí tự'
    },
    isStrongPassword: {
      options: {
        minLength: 6,
        minUppercase: 1,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1
      },
      errorMessage: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt'
    }
  },

  confirm_password: {
    notEmpty: {
      errorMessage: 'Xác nhận mật khẩu không được để trống'
    },
    custom: {
      options: (value, { req }) => value === req.body.password,
      errorMessage: 'Mật khẩu xác nhận không khớp'
    },
    isLength: {
      options: { min: 6, max: 50 },
      errorMessage: 'Mật khẩu xác nhận phải có ít nhất 6 ký tự và nhỏ hơn 50 kí tự'
    }
  },

  date_of_birth: {
    notEmpty: {
      errorMessage: 'Ngày sinh không được để trống'
    },
    isISO8601: {
      options: { strict: true, strictSeparator: true },
      errorMessage: 'Ngày sinh phải đúng định dạng ISO8601 (YYYY-MM-DD)'
    },
    toDate: true // Chuyển sang kiểu Date nếu cần
  }
})
