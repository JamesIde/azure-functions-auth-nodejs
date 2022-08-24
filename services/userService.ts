import * as bcrypt from "bcryptjs"
import * as jwt from "jsonwebtoken"
import { Context } from "@azure/functions"
import { User } from "../utilities/models/userModel"
import { parse, ParsedQs } from "qs"
import { genAccessToken } from "../utilities/helpers/genToken"

//////////////////////////////////////////////////////////
//// A collection of services to enable authentication////
//////////////////////////////////////////////////////////

/*
Middleware and token tester
*/
const getUsers = async (userId: string) => {
  const user = await User.findOne({ _id: userId }).select("-password")
  if (!user) {
    throw new Error("User not found")
  }
  return user
}
/*
Register a user
*/
const registerUser = async ({ req, res }: Context) => {
  /*
  Note:  Azure Functions does not automatically parse urlencoded data to json.
  You must parse the body yourself using qs parser library.
  https://dev.to/estruyf/parse-application-x-www-form-urlencoded-in-azure-function-61j
  */

  const parsedData: ParsedQs = parse(req.rawBody)
  const { name, email, password } = parsedData

  if (!name || !email || !password) {
    throw new Error("Please provide all required fields")
  }

  const isUserExist = await User.findOne({ email: email })
  if (isUserExist) {
    throw new Error("User already exists")
  }

  const hashPwd = await bcrypt.hash(password as string, 12)

  const user = new User({
    name,
    email,
    password: hashPwd,
  })

  const newUser = await user.save()

  if (!newUser) {
    // Return access token
    throw new Error("User not created")
  }
  return {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    accessToken: genAccessToken(newUser._id.toString()),
  }
}

/*
Login a user
*/
const loginUser = async ({ req, res }: Context) => {
  // See note in register for raw body parsing
  const parsedData: ParsedQs = parse(req.rawBody)
  const { email, password } = parsedData

  if (!email || !password) {
    throw new Error("Please provide all required fields")
  }

  const user = await User.findOne({ email: email })
  if (!user) {
    throw new Error("User not found")
  }

  const isMatch = await bcrypt.compare(password as string, user.password)
  if (!isMatch) {
    throw new Error("Incorrect password")
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    accessToken: genAccessToken(user._id.toString()),
  }
}

/*
Refresh the access token
*/
const refreshAccessToken = async ({ req, res }: Context) => {
  /* 
  At any stage the auth fails, we return an empty access token.
  */

  // Get token from cookie
  const token = req.headers.cookie
  if (!token) {
    return {
      ok: false,
      accessToken: "",
    }
  }
  // Split token
  const refreshToken = token.split(";")[0].split("=")[1]
  let payload: any
  try {
    payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET)
  } catch (error) {
    return {
      ok: false,
      accessToken: "",
    }
  }
  // Check if the user matches the user id
  const user = await User.findOne({ id: payload.userId })
  if (user._id.toString() !== payload.userId) {
    return {
      ok: false,
      accessToken: "",
    }
  }

  // Check if the token version matches, in the event someone gets hacked or forgets pwd.
  if (user.tokenVersion !== payload.tokenVersion) {
    return {
      ok: false,
      accessToken: "",
    }
  }

  // Token is valid, generate new access token
  return {
    ok: true,
    accessToken: genAccessToken(user._id.toString()),
  }
}
// Bundle and export
const userService = {
  getUsers,
  registerUser,
  loginUser,
  refreshAccessToken,
}

export default userService
