import Queue from 'bull';

import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher';
import { nats_wrapper } from '../nats-wrapper';

interface Payload {
  orderId: string;
}

const expiration_queue = new Queue<Payload>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST
  }
});

expiration_queue.process(async (job) => {
  await new ExpirationCompletePublisher(nats_wrapper.client).publish({
    orderId: job.data.orderId,
  });
});

export { expiration_queue };
