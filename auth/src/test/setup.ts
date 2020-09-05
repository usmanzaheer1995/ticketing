import { MongoMemoryServer } from 'mongodb-memory-server'; 
import mongoose from 'mongoose';

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
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});
