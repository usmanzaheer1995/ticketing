import request from 'supertest';
import mongoose from 'mongoose';

import app from '../../app';
import { Ticket } from '../../models/tickets';
import { nats_wrapper } from '../../nats-wrapper';

it('returns a 404 if the provided id does not exist', async () => {
  const id = mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'asdasd',
      price: 4000,
    })
    .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  const id = mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'asdasd',
      price: 4000,
    })
    .expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: "asdasd",
      price: 1000,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'new random string',
      price: 4000,
    })
    .expect(401);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: "asdasd",
      price: 1000,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 1000,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'valid title',
      price: -10,
    })
    .expect(400);
});

it('updates the ticket with the provided valid inputs', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: "asdasd",
      price: 1000,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'updated title',
      price: 100
    });

  const ticket_response = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();
  expect(ticket_response.body.title).toEqual('updated title');
  expect(ticket_response.body.price).toEqual(100);
});

it('publishes an event', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: "asdasd",
      price: 1000,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'updated title',
      price: 100
    });

  expect(nats_wrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates if a ticket is reserved', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: "asdasd",
      price: 1000,
    });

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'updated title',
      price: 100
    })
    .expect(400);
});
