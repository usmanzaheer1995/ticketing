import { OrderCancelledEvent, OrderStatus } from '@uzticketing/common';
import { Types } from 'mongoose';
import { Message } from 'node-nats-streaming';

import { OrderCancelledListener } from '../order-cancelled-listener';
import { nats_wrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCancelledListener(nats_wrapper.client);

  const order = Order.build({
    id: Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 2000,
    userId: 'asdqe',
    version: 0,
  });
  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: order.version + 1,
    ticket: {
      id: 'zxcqew',
    },
  };

  // Create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, order };
}

it('replicates the order info', async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);

  const updated_order = await Order.findById(order.id);

  expect(updated_order!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
