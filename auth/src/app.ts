import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError } from '@uzticketing/common';

import { currentUserRouter } from './routes/current-user';
import { signInRouter } from './routes/sign-in';
import { signOutRouter } from './routes/sign-out';
import { signUpRouter } from './routes/sign-up';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
  signed: false,
  // secure: process.env.NODE_ENV !== 'test',
  secure: false,
}));

app.use(currentUserRouter);
app.use(signUpRouter);
app.use(signInRouter);
app.use(signOutRouter);

app.all('*', () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app as default };