import { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
} from '@uzticketing/common';

import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { nats_wrapper } from '../nats-wrapper';

const router = Router();

router.post(
  '/api/payments',
  requireAuth,
  [
    body('token')
      .notEmpty()
      .withMessage('token is requires'),
    body('orderId')
      .notEmpty()
      .withMessage('order id is required')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId, token } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !==  req.current_user!.id) {
      throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('order already cancelled');
    }

    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100,
      source: token,
    });

    const payment = Payment.build({
      orderId,
      stripeId: charge.id,
      version: order.version,
    });

    await payment.save();

    new PaymentCreatedPublisher(nats_wrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
