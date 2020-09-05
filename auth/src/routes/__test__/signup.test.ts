import request from 'supertest';

import app from '../../app';

it('returns a 201 on a succesful signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'test12',
    })
    .expect(201);
});

it('returns a 400 with an invalid email', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@',
      password: 'test12',
    })
    .expect(400);
});

it('returns a 400 with an invalid password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: '123',
    })
    .expect(400);
});

it('returns a 400 with missing email and password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({})
    .expect(400);
});

it('disallows duplicate emails', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: "test@test.com",
      password: "test12",
    })
    .expect(201);

  await request(app)
    .post('/api/users/signup')
    .send({
      email: "test@test.com",
      password: "test12",
    })
    .expect(400);
});

it('sets a cookie after succesfull signup', async () => {
  const respose = await request(app)
    .post('/api/users/signup')
    .send({
      email: "test@test.com",
      password: "test12",
    })
    .expect(201);

  expect(respose.get('Set-Cookie')).toBeDefined();
});
