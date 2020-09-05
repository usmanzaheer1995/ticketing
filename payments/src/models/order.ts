import { Schema, model, Model, Document } from 'mongoose';
import { OrderStatus } from '@uzticketing/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface IOrderAttrs {
  id: string;
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

interface IOrderDoc extends Document {
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

interface IOrderModel extends Model<IOrderDoc> {
  build(attrs: IOrderAttrs): IOrderDoc;
}

const orderSchema = new Schema({
  userId: { type: String, required: true },
  price: { type: Number, required: true },
  status: {
    type: String,
    required: true,
    enum: Object.values(OrderStatus),
    default: OrderStatus.Created,
  },
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      ret._id = undefined;
    },
  },
});

orderSchema.statics.build = (attrs: IOrderAttrs) => {
  return new Order({
    _id: attrs.id,
    version: attrs.version,
    price: attrs.price,
    userId: attrs.userId,
    status: attrs.status,
  });
}

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

const Order = model<IOrderDoc, IOrderModel>('Order', orderSchema);

export { Order };
