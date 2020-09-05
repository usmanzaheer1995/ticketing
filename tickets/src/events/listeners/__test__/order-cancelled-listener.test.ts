import mongoose from 'mongoose';
import { OrderCancelledEvent } from '@uzticketing/common';

import { OrderCancelledListener } from "../order-cancelled-listener";
import { nats_wrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/tickets";
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const listener = new OrderCancelledListener(nats_wrapper.client);

  const orderId = mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    price: 2000,
    title: 'concert',
    userId: 'asdf',
  });
  await ticket.set({ orderId }).save();

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, data, ticket, orderId, listener };
}

it('updates the ticket, publishes an event, and acks the msg', async () => {
  const { msg, data, ticket, orderId, listener } = await setup();

  await listener.onMessage(data, msg);

  const updated_ticket = await Ticket.findById(ticket.id);
  expect(updated_ticket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(nats_wrapper.client.publish).toHaveBeenCalled();
});
