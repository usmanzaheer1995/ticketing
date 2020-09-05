import request from 'supertest';
import mongoose from 'mongoose';

import app from '../../app';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { nats_wrapper } from '../../nats-wrapper';

it('marks an order as cancelled', async () => {
  // Create a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: 2000,
    title: 'concert',
  });
  ticket.save();

  const user = global.signin();

  // Make a request to create an order
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // Make a request to cancel an order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  // expect to make sure it is cancelled
  const updated_order = await Order.findById(order.id);
  expect(updated_order!.status).toEqual(OrderStatus.Cancelled);
});

it('should emit an order cancelled event', async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: 2000,
    title: 'concert',
  });
  ticket.save();

  const user = global.signin();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  expect(nats_wrapper.client.publish).toHaveBeenCalled();
});
