import { Request, Response, Router } from 'express';
import { NotFoundError } from '@uzticketing/common';

import { Ticket } from '../models/tickets';

const router = Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);

  if (ticket == null) {
    throw new NotFoundError();
  }

  res.send(ticket);
});

export { router as showTicketRouter }
