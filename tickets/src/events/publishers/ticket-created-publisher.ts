import { Subjects, ITicketCreatedEvent, Publisher } from '@uzticketing/common';

export class TicketCreatedPublisher extends Publisher<ITicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
