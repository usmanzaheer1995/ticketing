import request from 'supertest';

import app from '../../app';

it('responds with details about the current user', async () => {
  // agent is used to test cookies.
  // automatically attaches cookie to request
  const agent = request.agent(app);

  const email = 'test@test.com';
  const password = 'test12';
  await agent
    .post('/api/users/signup')
    .send({ email, password })
    .expect(201);

  const response = await agent
    .get('/api/users/currentuser')
    .send()
    .expect(200);

  expect(response.body.current_user.email).toEqual('test@test.com');
});

it('responds with null if not authenticated', async () => {
  const agent = request.agent(app);

  const response = await agent
    .get('/api/users/currentuser')
    .send()
    .expect(200);

  expect(response.body.current_user).toBeNull();
});
