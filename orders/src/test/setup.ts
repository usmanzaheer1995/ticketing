import { MongoMemoryServer } from 'mongodb-memory-server'; 
import mongoose from 'mongoose';
import { sign } from 'jsonwebtoken';

declare global {
  namespace NodeJS {
    interface Global {
      signin(): string[];
    }
  }
}

jest.mock('../nats-wrapper.ts');

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'random-test-string';
  
  mongo = new MongoMemoryServer();
  const mongo_uri = await mongo.getUri();

  await mongoose.connect(mongo_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = () => {
  // Build a jwt payload. { id, email }
  const payload = {
    id: mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
  };

  // Create the JWT
  const token = sign(payload, process.env.JWT_KEY!);

  // Build session object. { jwt: MY_JWT }
  const session = { jwt: token };

  // Turn that session into JSON
  const session_json = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(session_json).toString('base64');

  // return a string that's the cookie with the encoded data
  return [`express:sess=${base64}`];
}
