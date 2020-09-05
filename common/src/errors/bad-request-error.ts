import { CustomError } from './custom-error';

export class BadRequestError extends CustomError {
  status_code = 400;

  constructor (public message: string) {
    super(message);

    // Only because we are extending a built in class and transpiling to 'es5'
    // in tsconfig.json
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
