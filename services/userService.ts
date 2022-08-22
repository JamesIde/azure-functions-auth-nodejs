import * as bcrypt from "bcryptjs"
import * as jwt from "jsonwebtoken"
import { Context } from "@azure/functions"
import { User } from "../utilities/models/userModel"
import { parse, ParsedQs } from "qs"
import { genAccessToken } from "../utilities/helpers/genToken"
import { isAuth } from "../utilities/helpers/authMiddleware"

const getUsers = async (userId: string) => {
  const user = await User.findOne({ _id: userId }).select("-password")
  if (!user) {
    throw new Error("User not found")
  }
  return user
}

const registerUser = async ({ req, res }: Context) => {
  if (req.rawBody) {
    const parsedData: ParsedQs = parse(req.rawBody)
    const { name, email, password } = parsedData

    if (!name || !email || !password) {
      throw new Error("Please provide all required fields")
    }

    const isUserExist = await User.findOne({ email: email })
    if (isUserExist) {
      throw new Error("User already exists")
    }

    const hashPwd = await bcrypt.hash(password.toString(), 12)

    const user = new User({
      name,
      email,
      password: hashPwd,
    })

    const newUser = await user.save()

    if (newUser) {
      // Return access token
      return {
        id: newUser._id,
        accessToken: genAccessToken(newUser._id.toString()),
      }
    } else {
      throw new Error("User not created")
    }
  } else {
    throw new Error("An error occured, please try again")
  }
}

const loginUser = async ({ req, res }: Context, token: string) => {
  if (req.rawBody) {
    const parsedData: ParsedQs = parse(req.rawBody)
    const { email, password } = parsedData

    if (!email || !password) {
      throw new Error("Please provide all required fields")
    }

    const user = await User.findOne({ email: email })
    if (!user) {
      throw new Error("User not found")
    }

    const isMatch = await bcrypt.compare(password.toString(), user.password)
    if (!isMatch) {
      throw new Error("Incorrect password")
    }

    return {
      id: user._id,
      accessToken: genAccessToken(user._id.toString()),
    }
  } else {
    throw new Error("An error occured, please try again")
  }
}

const refreshAccessToken = async ({ req, res }: Context) => {
  const token = req.headers.cookie
  if (!token) {
    return ""
  }
  // Split it like a auth bearer token
  const refreshToken = token.split(";")[0].split("=")[1]
  let payload: any
  try {
    payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET)
  } catch (error) {
    return ""
  }
  /// Token is valid
  const user = await User.findOne({ id: payload.id })
  if (user._id.toString() !== payload.id) {
    return ""
  }

  // Token is valid, generate new access token
  return {
    ok: true,
    accessToken: genAccessToken(user._id.toString()),
  }
}

const userService = {
  getUsers,
  registerUser,
  loginUser,
  refreshAccessToken,
}

export default userService
