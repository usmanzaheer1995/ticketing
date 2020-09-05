import { Request, Response, NextFunction } from 'express';

import { NotAuthorizedError } from '../errors/not-authorized-error';

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.current_user) {
    throw new NotAuthorizedError();
  }
  next();
}
