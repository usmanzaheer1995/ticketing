import { Listener, OrderCreatedEvent, Subjects } from '@uzticketing/common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queue-group-name';
import { expiration_queue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    await expiration_queue.add(
      { orderId: data.id },
      {
        delay
      },
    );
    msg.ack();
  }
}
