import { Request, Response, Router } from 'express';
import { requireAuth, OrderStatus, NotFoundError, NotAuthorizedError } from '@uzticketing/common';

import { Order } from '../models/order';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { nats_wrapper } from '../nats-wrapper';

const router = Router();

router.delete('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId).populate('ticket');
  if (!order) {
    throw new NotFoundError();
  }
  if (order.userId !== req.current_user!.id) {
    throw new NotAuthorizedError();
  }
  order.status = OrderStatus.Cancelled;
  await order.save();

  new OrderCancelledPublisher(nats_wrapper.client).publish({
    id: order.id,
    version: order.version,
    ticket: {
      id: order.ticket.id,
    },
  });

  res.status(204).send(order);
});

export { router as deleteOrderRouter }
