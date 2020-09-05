import { Schema, model, Model, Document } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { Order, OrderStatus } from './order';

interface ITicketAttrs {
  id: string;
  title: string;
  price: number;
}

export interface ITicketDoc extends Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>
}

interface ITicketModel extends Model<ITicketDoc> {
  build(attrs: ITicketAttrs): ITicketDoc;
  findByEvent(event: { id: string, version: number }): Promise<ITicketDoc | null>
}

const ticketSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      ret._id = undefined;
    },
  },
  versionKey: false,
});

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.findByEvent = (event: { id: string, version: number }) => {
  return Ticket.findOne({ _id: event.id, version: event.version - 1 })
};

ticketSchema.statics.build = (attrs: ITicketAttrs) => {
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
}

ticketSchema.methods.isReserved = async function() {
  const existing_order = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete
      ],
    },
  });

  return !!existing_order;
}

const Ticket = model<ITicketDoc, ITicketModel>('Ticket', ticketSchema);

export { Ticket };
