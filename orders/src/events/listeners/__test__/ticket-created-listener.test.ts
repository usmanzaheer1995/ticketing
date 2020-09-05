import { ITicketCreatedEvent } from '@uzticketing/common';
import { Types } from 'mongoose';
import { Message } from 'node-nats-streaming';

import { TicketCreatedListener } from '../ticket-created-listener';
import { nats_wrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = () => {
  // Create an instance of the listener
  const listener = new TicketCreatedListener(nats_wrapper.client);

  // Create a fake data event
  const data: ITicketCreatedEvent['data'] = {
    version: 0,
    id: Types.ObjectId().toHexString(),
    title: 'concert',
    price: 2000,
    userId: Types.ObjectId().toHexString(),
  };

  // Create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
}

it('should create and save a ticket', async () => {
  const { listener, data, msg } = setup();

  // Call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // Write assertions to make sure ticket was created
  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
})

it('should acks the message', async () => {
  const { listener, data, msg } = await setup();

  // Call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // Write assertions to make sure ack was called
  expect(msg.ack).toHaveBeenCalled();
})
