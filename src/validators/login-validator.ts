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
  password: {
    trim: true,
    errorMessage: 'Password is required',
    notEmpty: true,
  },
});
