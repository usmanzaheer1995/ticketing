import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { sign } from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@uzticketing/common';

import { User } from '../models/user';

const router = Router();

router.post(
  '/api/users/signup', [
    body('email')
      .isEmail()
      .withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existing_user = await User.findOne({ email });

    if (existing_user) {
      throw new BadRequestError('email already exists');
    }

    const user = User.build({ email, password });
    await user.save();

    // generate jwt
    const user_jwt = sign({
      id: user.id,
      email: user.email,
    },
      process.env.JWT_KEY!
    );

    // store it in session
    req.session = {
      jwt: user_jwt,
    };

    res.status(201).send(user);
  }
);

export { router as signUpRouter };
