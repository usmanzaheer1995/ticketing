import { ITicketUpdatedEvent } from '@uzticketing/common';
import { Types } from 'mongoose';
import { Message } from 'node-nats-streaming';

import { TicketUpdatedListener } from '../ticket-updated-listener';
import { nats_wrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // Create an instance of the listener
  const listener = new TicketUpdatedListener(nats_wrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    id: Types.ObjectId().toHexString(),
    price: 3000,
    title: 'concert',
  });
  await ticket.save();

  // Create a fake data event
  const data: ITicketUpdatedEvent['data'] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: 'updated concert',
    price: 2000,
    userId: Types.ObjectId().toHexString(),
  };

  // Create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket };
}

it('finds, updates, and saves a ticket ', async () => {
  const { listener, data, msg, ticket } = await setup();
  await listener.onMessage(data, msg);
  const updated_ticket = await Ticket.findById(ticket.id);
  expect(updated_ticket!.title).toEqual(data.title);
  expect(updated_ticket!.price).toEqual(data.price);
});

it('acks the msg', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has skipped version number', async () => {
  const { listener, data, msg, ticket } = await setup();
  
  data.version = 10;
  
  try {
    await listener.onMessage(data, msg);
  } catch (err) { }
  expect(msg.ack).not.toHaveBeenCalled();
});
