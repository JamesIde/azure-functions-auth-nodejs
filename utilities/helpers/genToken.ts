import * as jwt from "jsonwebtoken"
import { idText } from "typescript"
import { connectDb } from "../config/connectDb"
import { User } from "../models/userModel"
const genAccessToken = (id: string) => {
  return jwt.sign({ id }, process.env.ACCESS_SECRET, {
    expiresIn: "30s",
  })
}

const genRefreshToken = async (id: string) => {
  // Fetch user to access the token version
  const user = await User.findOne({ _id: id })

  return jwt.sign(
    { userId: user._id, tokenVersion: user.tokenVersion },
    process.env.REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  )
}

export { genAccessToken, genRefreshToken }
