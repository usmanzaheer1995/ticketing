import { Publisher, OrderCancelledEvent, Subjects } from '@uzticketing/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
