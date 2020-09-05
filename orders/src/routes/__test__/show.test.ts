import request from 'supertest';
import mongoose from 'mongoose';

import app from '../../app';
import { Ticket } from '../../models/ticket';

it('fetches the order', async () => {
  // Create a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: 2000,
    title: 'concert',
  });
  ticket.save();

  const user = global.signin();

  // Make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // Make request to fetch the order
  const { body: fetched_order } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);
  expect(fetched_order.id).toEqual(order.id);
});

it('returns an error if one user tries to fetch another users orders', async () => {
  // Create a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: 2000,
    title: 'concert',
  });
  ticket.save();

  const user = global.signin();

  // Make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // Make request to fetch the order
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(401);
});
