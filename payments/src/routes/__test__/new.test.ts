import request from 'supertest';
import { Types } from 'mongoose';
import { OrderStatus } from '@uzticketing/common';

import app from '../../app';
import { Order } from '../../models/order';
import { Payment } from '../../models/payment';
import { stripe } from '../../stripe';

jest.mock('../../stripe.ts');

it('returns a 404 when purchasing an error that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'asdqwe',
      orderId: Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('returns a 401 when purchasing an order that does not belong to the user', async () => {
  const order = Order.build({
    id: Types.ObjectId().toHexString(),
    userId: Types.ObjectId().toHexString(),
    version: 0,
    price: 2000,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
  .post('/api/payments')
  .set('Cookie', global.signin())
  .send({
    token: 'asdqwe',
    orderId: order.id,
  })
  .expect(401);
});

it('return a 400 when purchasing a cancelled order', async () => {
  const userId = Types.ObjectId().toHexString();
  const order = Order.build({
    id: Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 2000,
    status: OrderStatus.Cancelled,
  });
  await order.save();

  await request(app)
  .post('/api/payments')
  .set('Cookie', global.signin(userId))
  .send({
    token: 'asdqwe',
    orderId: order.id,
  })
  .expect(400);
});

it('returns a 201 with valid inputs', async () => {
  const userId = Types.ObjectId().toHexString();
  const order = Order.build({
    id: Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  const charge_options = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(charge_options.source).toEqual('tok_visa');
  expect(charge_options.amount).toEqual(20 * 100);
  expect(charge_options.currency).toEqual('usd');
});
