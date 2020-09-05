import { OrderCreatedEvent, OrderStatus } from '@uzticketing/common';
import { Types } from 'mongoose';
import { Message } from 'node-nats-streaming';

import { OrderCreatedListener } from '../order-created-listener';
import { nats_wrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';

const setup = () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(nats_wrapper.client);

  // Create a fake data event
  const data: OrderCreatedEvent['data'] = {
    id: Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: 'asdas',
    userId: 'zxcz',
    status: OrderStatus.Created,
    ticket: {
      id: 'qweqwe',
      price: 2000,
    },
  };

  // Create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
}

it('replicates the order info', async () => {
  const { listener, data, msg } = setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
  const { listener, data, msg } = setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
