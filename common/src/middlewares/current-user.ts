import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

interface IUserPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      current_user?: IUserPayload,
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session?.jwt) {
    return next();
  }

  try {
    const payload = verify(req.session.jwt, process.env.JWT_KEY!) as IUserPayload;
    req.current_user = payload;
  } catch (error) { }

  next();
}
