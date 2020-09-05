export abstract class CustomError extends Error {
  abstract status_code: number;

  constructor (message: string) {
    super(message);

    // Only because we are extending a built in class and transpiling to 'es5'
    // in tsconfig.json
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  abstract serializeErrors(): { message: string, field?: string }[];
}