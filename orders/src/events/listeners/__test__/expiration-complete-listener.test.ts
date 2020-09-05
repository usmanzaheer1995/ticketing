import { ExpirationCompleteEvent } from '@uzticketing/common';
import { Types } from 'mongoose';
import { Message } from 'node-nats-streaming';

import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { nats_wrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { Order, OrderStatus } from '../../../models/order';

const setup = async () => {
  const listener = new ExpirationCompleteListener(nats_wrapper.client);

  const ticket = Ticket.build({
    id: Types.ObjectId().toHexString(),
    price: 3000,
    title: 'concert',
  });
  await ticket.save();

  const order = Order.build({
    status: OrderStatus.Created,
    userId: 'asdasd',
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, order, data, msg, ticket };
};

it('updates the order status to cancelled', async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);

  const updated_order = await Order.findById(order.id)

  expect(updated_order!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an OrderCancelled event', async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);

  expect(nats_wrapper.client.publish).toHaveBeenCalled();

  const event_data = JSON.parse(((nats_wrapper.client.publish) as jest.Mock).mock.calls[0][1]);
  expect(event_data.id).toEqual(order.id);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});