import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { sign } from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@uzticketing/common';

import { User } from '../models/user';
import { PasswordManager } from '../utils/password-manager';

const router = Router();

router.post('/api/users/signin',
  [
    body('email')
      .isEmail()
      .withMessage('email must be valid'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('password is required')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existing_user = await User.findOne({ email });
    if (!existing_user) {
      throw new BadRequestError('invalid credentials');
    }

    const passwords_match = await PasswordManager.compare(existing_user.password, password);
    if (!passwords_match) {
      throw new BadRequestError('invalid credentials');
    }

    // generate jwt
    const user_jwt = sign({
      id: existing_user.id,
      email: existing_user.email,
    },
      process.env.JWT_KEY!
    );

    // store it in session
    req.session = {
      jwt: user_jwt,
    };

    res.status(200).send(existing_user);
  }
);

export { router as signInRouter };
