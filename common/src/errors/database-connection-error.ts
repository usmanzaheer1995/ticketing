import { CustomError } from './custom-error';

export class DatabaseConnectionError extends CustomError {
  reason = 'Error connecting to database';
  status_code = 500;

  constructor () {
    super('Error connecting to db');

    // Only because we are extending a built in class and transpiling to 'es5'
    // in tsconfig.json
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  serializeErrors () {
    return [
      { message: this.reason },
    ];
  }
}