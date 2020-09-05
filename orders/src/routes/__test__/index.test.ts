import request from 'supertest';
import mongoose from 'mongoose';

import app from '../../app';
import { Ticket } from '../../models/ticket';

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 2000,
  });
  await ticket.save();
  return ticket;
}

it('fetches orders for a particular user', async () => {
  // Create three tickets
  const ticket_one = await buildTicket();
  const ticket_two = await buildTicket();
  const ticket_three = await buildTicket();

  const user_one = global.signin();
  const user_two = global.signin();

  // Create one order as User #1
  await request(app)
    .post('/api/orders')
    .set('Cookie', user_one)
    .send({ ticketId: ticket_one.id })
    .expect(201);

  // Create two orders as User #2
  const { body: order_one } = await request(app)
    .post('/api/orders')
    .set('Cookie', user_two)
    .send({ ticketId: ticket_two.id })
    .expect(201);
  const { body: order_two } = await request(app)
    .post('/api/orders')
    .set('Cookie', user_two)
    .send({ ticketId: ticket_three.id })
    .expect(201);

  // Make request to get orders for User #2
  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', user_two)
    .send()
    .expect(200);

  // Make sure we only got the orders for User #2
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(order_one.id);
  expect(response.body[1].id).toEqual(order_two.id);
  expect(response.body[0].ticket.id).toEqual(ticket_two.id);
  expect(response.body[1].ticket.id).toEqual(ticket_three.id);
});
