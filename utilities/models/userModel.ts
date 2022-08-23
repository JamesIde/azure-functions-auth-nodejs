import mongoose, { Schema } from "mongoose"

export interface IUser {
  name: string
  email: string
  password: string
  tokenVersion: number
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  tokenVersion: {
    type: Number,
    default: 0,
  },
})

export const User = mongoose.model<IUser>("User", userSchema)
