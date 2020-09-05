import request from 'supertest';
import mongoose from 'mongoose';

import app from '../../app';

it('returns a 404 if the ticket is not found', async () => {
  const id = mongoose.Types.ObjectId().toHexString();
  await request(app)
    .get(`/api/tickets/${id}`)
    .send()
    .expect(404);
});

it('returns the ticket if the ticket is found', async () => {
  const title = 'concert';
  const price = 4000;

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title, price })
    .expect(201);

  const ticket_response = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);
  
    expect(ticket_response.body.title).toEqual(title);
    expect(ticket_response.body.price).toEqual(price);
});
