import { Schema, model, Model, Document } from 'mongoose';

import { PasswordManager } from '../utils/password-manager';

// ? An interface that describes the properties
// ? that are required to create a new User
interface IUserAttrs {
  email: string;
  password: string;
}

// ? An interface that describes the properties
// ? a User Document has
interface IUserDoc extends Document {
  email: string;
  password: string;
}

// ? An interface that describes the properties
// ? that a User Model has
interface IUserModel extends Model<IUserDoc> {
  build(attrs: IUserAttrs): IUserDoc,
}

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      ret._id = undefined;
      ret.password = undefined;
    },
    versionKey: false,
  },
});

userSchema.pre('save', async function(done) {
  if (this.isModified('password')) {
    const hashed = await PasswordManager.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

// ? whenever we want to create a new user, use this function
// ? for type checking
userSchema.statics.build = (attrs: IUserAttrs) => new User(attrs);

const User = model<IUserDoc, IUserModel>('User', userSchema);

export { User };
