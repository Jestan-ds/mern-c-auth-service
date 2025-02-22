import { checkSchema } from 'express-validator';

//export  default[(body("email")).notEmpty().withMessage("Email is required")];

export default checkSchema({
  email: {
    notEmpty: true,
    errorMessage: 'Email is required',
  },
});
