import { Context } from "@azure/functions"
import * as jwt from "jsonwebtoken"
interface Token {
  id: string
  exp: number
  iat: number
}
export function isAuth(req: any, context: Context) {
  try {
    // Check the header
    if (!req.headers.authorization) {
      throw new Error("No authorization token found")
    }
    // Split the token
    const token = req.headers.authorization.split(" ")[1]

    // Verify the token
    if (!token || token === "" || token === undefined) {
      throw new Error("No token found")
    }

    // Decode the token
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET) as Token

    if (!decoded) {
      throw new Error("Invalid token")
    }
    // Return the ID for querying
    return decoded.id
  } catch (error) {
    context.res = {
      status: 403,
      headers: {
        "Content-Type": "application/json",
      },
      body: { message: error.message },
    }
  }

  // Find the user and return it
}
