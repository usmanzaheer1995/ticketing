import { Subjects, ITicketUpdatedEvent, Publisher } from '@uzticketing/common';

export class TicketUpdatedPublisher extends Publisher<ITicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
