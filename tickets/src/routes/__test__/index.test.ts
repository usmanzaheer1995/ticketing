import request from 'supertest';

import app from '../../app';

const createTickets = () => {
  return Promise.all([
    request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({ title: 'concert', price: '4000' }),

    request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({ title: 'seminar', price: '500' }),

    request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({ title: 'book reading', price: '500' }),
  ]);
}

it('can fetch a list of tickets', async () => {
  await createTickets();

  const response = await request(app)
    .get('/api/tickets')
    .send()
    .expect(200);

  expect(response.body.length).toEqual(3);
});
