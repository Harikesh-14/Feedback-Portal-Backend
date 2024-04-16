import mongoose from "mongoose";
import { Schema, model } from "mongoose";

type UserTypes = {
  firstName: string;
  lastName: string;
  email: string;
  phone: number;
  password: string;
}

const UserSchema: Schema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
})

const UserModel = mongoose.model<UserTypes>("User", UserSchema);

export default UserModel;