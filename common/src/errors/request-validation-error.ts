import { ValidationError } from 'express-validator';
import { CustomError } from './custom-error';

export class RequestValidationError extends CustomError {
  status_code = 400;

  constructor (private errors: ValidationError[]) {
    super('Invalid request parameters');

    // Only because we are extending a built in class and transpiling to 'es5'
    // in tsconfig.json
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors () {
    return this.errors.map(err => ({
      message: err.msg,
      field: err.param,
    }));
  }
}