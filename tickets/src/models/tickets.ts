import { Schema, model, Model, Document } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface ITicketAttrs {
  title: string;
  price: number;
  userId: string;
}

interface ITicketDoc extends Document {
  title: string;
  price: number;
  userId: string;
  version: number;
  orderId?: string;
}

interface ITicketModel extends Model<ITicketDoc> {
  build(attrs: ITicketAttrs): ITicketDoc
}

const ticketSchema = new Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  userId: { type: String, required: true },
  orderId: { type: String, },
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      ret._id = undefined;
    },
  },
});

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs: ITicketAttrs) => new Ticket(attrs);

const Ticket = model<ITicketDoc, ITicketModel>('Ticket', ticketSchema);

export { Ticket };
