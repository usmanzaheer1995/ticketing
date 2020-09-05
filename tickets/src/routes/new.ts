import { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@uzticketing/common';

import { Ticket } from '../models/tickets';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { nats_wrapper } from '../nats-wrapper';

const router = Router();

router.post(
  '/api/tickets',
  requireAuth,
  [
    body('title')
      .notEmpty().withMessage('title is required'),
    body('price')
      .isInt({ gt: 0 })
      .withMessage('price must be greater than zero')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const ticket = Ticket.build({ title, price, userId: req.current_user!.id });
    await ticket.save();
    await new TicketCreatedPublisher(nats_wrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });
    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter }
