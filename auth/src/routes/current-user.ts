import { Router, Request, Response } from 'express';

import { currentUser } from '@uzticketing/common';

const router = Router();

router.get(
  '/api/users/currentuser',
  currentUser,
  (req: Request, res: Response) => {
    res.send({ current_user: req.current_user || null });
  }
);

export { router as currentUserRouter };
