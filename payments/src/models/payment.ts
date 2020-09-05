import { Schema, model, Model, Document } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface IPaymentAttrs {
  version: number;
  orderId: string;
  stripeId: string;
}

interface IPaymentDoc extends Document {
  version: number;
  orderId: string;
  stripeId: string;
}

interface IPaymentModel extends Model<IPaymentDoc> {
  build(attrs: IPaymentAttrs): IPaymentDoc;
}

const paymentSchema = new Schema({
  orderId: { type: String, required: true },
  stripeId: { type: String, required: true }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      ret._id = undefined;
    },
  },
});

paymentSchema.statics.build = (attrs: IPaymentAttrs) => {
  return new Payment(attrs);
}

paymentSchema.set('versionKey', 'version');
paymentSchema.plugin(updateIfCurrentPlugin);

const Payment = model<IPaymentDoc, IPaymentModel>('Payment', paymentSchema);

export { Payment };
