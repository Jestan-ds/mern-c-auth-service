import { checkSchema } from 'express-validator';

//export  default[(body("email")).notEmpty().withMessage("Email is required")];

export default checkSchema({
  email: {
    trim: true,
    errorMessage: 'Email is required',
    notEmpty: true,
    isEmail: {
      errorMessage: 'Email should be valid',
    },
  },
  firstName: {
    trim: true,
    errorMessage: 'First name is required',
    notEmpty: true,
  },
  lastName: {
    trim: true,
    errorMessage: 'Last name is required',
    notEmpty: true,
  },
  password: {
    trim: true,
    errorMessage: 'Password is required',
    notEmpty: true,
    isLength: {
      options: { min: 8 },
      errorMessage: 'Password should be at least 8 characters',
    },
  },
});
