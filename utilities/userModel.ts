import mongoose, { Schema } from "mongoose"

interface IUser {
  name: string
  email: string
  password: string
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
})

export const User = mongoose.model<IUser>("User", userSchema)
