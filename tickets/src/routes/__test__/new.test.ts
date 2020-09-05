import request from 'supertest';

import app from '../../app';
import { Ticket } from '../../models/tickets';
import { nats_wrapper } from '../../nats-wrapper';

it('has a route handler listening to /api/tickets for POST requests', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .send({});

  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  await request.agent(app)
    .post('/api/tickets')
    .send({})
    .expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const response =  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({});
  expect(response.status).not.toEqual(401);
})

it('returns an error is an invalid title is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: '',
      price: 10,
    })
    .expect(400);
  
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      price: 10,
    })
    .expect(400);
});

it('returns an error is an invalid price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'test title',
      price: -10,
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'test title 2',
    })
    .expect(400);
});

it('creates a ticket with valid inputs', async () => {
  let tickets = await Ticket.find({}).countDocuments();
  expect(tickets).toEqual(0);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'new ticket',
      price: 10,
    })
    .expect(201);

  tickets = await Ticket.find({}).countDocuments();
  expect(tickets).toEqual(1);
});

it('publishes an event', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'new ticket',
      price: 10,
    })
    .expect(201);

  expect(nats_wrapper.client.publish).toHaveBeenCalled();
});
