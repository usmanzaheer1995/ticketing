import { Schema, model, Model, Document } from 'mongoose';
import { OrderStatus } from '@uzticketing/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { ITicketDoc } from './ticket';

export { OrderStatus };

interface IOrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: ITicketDoc;
}

interface IOrderDoc extends Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  version: number;
  ticket: ITicketDoc;
}

interface IOrderModel extends Model<IOrderDoc> {
  build(attrs: IOrderAttrs): IOrderDoc;
}

const orderSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(OrderStatus),
    default: OrderStatus.Created,
  },
  expiresAt: {
    type: Schema.Types.Date,
  },
  ticket: {
    type: Schema.Types.ObjectId,
    ref: 'Ticket',
  },
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      ret._id = undefined;
    },
  },
});

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: IOrderAttrs) => {
  return new Order(attrs);
}

const Order = model<IOrderDoc, IOrderModel>('Order', orderSchema);

export { Order };
