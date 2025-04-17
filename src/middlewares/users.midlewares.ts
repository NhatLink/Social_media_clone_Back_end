import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import userService from '../services/users.services'
import { ErrorWithStatus } from '../models/Errors'
import { validationMessages } from '../constants/validationMessages '
import databaseService from '../services/database.services'
import { hashPassword } from '../units/crypto'

export const loginValidator = checkSchema({
  email: {
    notEmpty: {
      errorMessage: validationMessages.email.required
    },
    isEmail: {
      errorMessage: validationMessages.email.invalid
    },
    normalizeEmail: true,
    custom: {
      options: async (value, { req }) => {
        const user = await databaseService.users.findOne({ email: value, password: hashPassword(req.body.password) })
        if (!user) {
          throw new Error(validationMessages.email.emalilNotFound)
        }
        req.user = user
        return true
      }
    }
  },

  password: {
    notEmpty: {
      errorMessage: validationMessages.password.required
    },
    isLength: {
      options: { min: 6, max: 50 },
      errorMessage: validationMessages.password.length
    },
    isStrongPassword: {
      options: {
        minLength: 6,
        minUppercase: 1,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1
      },
      errorMessage: validationMessages.password.strong
    }
  }
})

export const registerValidation = checkSchema({
  name: {
    notEmpty: {
      errorMessage: validationMessages.name.required
    },
    isLength: {
      options: { min: 2, max: 100 },
      errorMessage: validationMessages.name.length
    },
    trim: true,
    escape: true
  },

  email: {
    notEmpty: {
      errorMessage: validationMessages.email.required
    },
    isEmail: {
      errorMessage: validationMessages.email.invalid
    },
    normalizeEmail: true,
    custom: {
      options: async (value) => {
        const emailExists = await userService.checkEmailExists(value)
        if (emailExists) {
          throw new Error(validationMessages.email.exists)
        }
        return true
      }
    }
  },

  password: {
    notEmpty: {
      errorMessage: validationMessages.password.required
    },
    isLength: {
      options: { min: 6, max: 50 },
      errorMessage: validationMessages.password.length
    },
    isStrongPassword: {
      options: {
        minLength: 6,
        minUppercase: 1,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1
      },
      errorMessage: validationMessages.password.strong
    }
  },

  confirm_password: {
    notEmpty: {
      errorMessage: validationMessages.confirmPassword.required
    },
    custom: {
      options: (value, { req }) => value === req.body.password,
      errorMessage: validationMessages.confirmPassword.mismatch
    },
    isLength: {
      options: { min: 6, max: 50 },
      errorMessage: validationMessages.confirmPassword.length
    }
  },

  date_of_birth: {
    notEmpty: {
      errorMessage: validationMessages.dateOfBirth.required
    },
    isISO8601: {
      options: { strict: true, strictSeparator: true },
      errorMessage: validationMessages.dateOfBirth.format
    },
    toDate: true
  }
})
