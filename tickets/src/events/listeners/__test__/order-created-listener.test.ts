import { OrderCreatedEvent, OrderStatus } from '@uzticketing/common';
import { Types } from 'mongoose';
import { Message } from 'node-nats-streaming';

import { OrderCreatedListener } from '../order-created-listener';
import { nats_wrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/tickets';

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(nats_wrapper.client);

  // create and save ticket
  const ticket = Ticket.build({
    price: 2000,
    title: 'concert',
    userId: '123asd',
  });
  await ticket.save();

  // create fake data event
  const data: OrderCreatedEvent['data'] = {
    id: Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
    userId: 'asda',
    expiresAt: 'asdasd',
    ticket: {
        id: ticket.id,
        price: ticket.price,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, msg, data };
}

it('sets the userId of the ticket ', async () => {
  const { ticket, data, msg, listener } = await setup();

  await listener.onMessage(data, msg);

  const updated_ticket = await Ticket.findById(ticket.id);

  expect(updated_ticket!.orderId).toEqual(data.id);
});

it('calls the ack msg', async () => {
  const { data, msg, listener } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { ticket, data, msg, listener } = await setup();
  await listener.onMessage(data, msg);

  expect(nats_wrapper.client.publish).toHaveBeenCalled();

  const ticket_updated_data = JSON.parse((nats_wrapper.client.publish as jest.Mock).mock.calls[0][1]);

  expect(data.id).toEqual(ticket_updated_data.orderId);
});
