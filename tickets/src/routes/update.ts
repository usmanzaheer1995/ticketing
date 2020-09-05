import { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import {
  NotFoundError,
  validateRequest,
  requireAuth,
  NotAuthorizedError,
  BadRequestError,
} from '@uzticketing/common';

import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { nats_wrapper } from '../nats-wrapper';

import { Ticket } from '../models/tickets';

const router = Router();

router.put(
  '/api/tickets/:id',
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
    const ticket = await Ticket.findById(req.params.id);

    if (ticket == null) {
      throw new NotFoundError();
    }

    if (ticket.orderId) {
      throw new BadRequestError('Ticket is reserved');
    }

    if (ticket.userId !== req.current_user?.id) {
      throw new NotAuthorizedError();
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });

    await ticket.save();
    await new TicketUpdatedPublisher(nats_wrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.send(ticket);
  }
);

export { router as updateTicketRouter }