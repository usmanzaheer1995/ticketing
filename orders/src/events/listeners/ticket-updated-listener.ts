import { Message } from 'node-nats-streaming';
import {
  Subjects,
  Listener,
  ITicketUpdatedEvent,
} from '@uzticketing/common';

import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketUpdatedListener extends Listener<ITicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: ITicketUpdatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findByEvent(data);
    if (!ticket) {
      throw new Error('ticket not found');
    }

    const { title, price } = data;
    ticket.set({ title, price });
    await ticket.save();

    msg.ack();
  }
}
