import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import userService from "../services/userService"
import { connectDb } from "../utilities/config/connectDb"
import { genRefreshToken } from "../utilities/helpers/genToken"

/*
Register a user, return an access token and refresh token in a cookie
*/
const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  let response: any

  try {
    await connectDb()
    response = await userService.registerUser(context)
    // User created, generate the refresh token for cookie
    const refreshToken = genRefreshToken(response.id as string)
    context.res = {
      status: 200,
      body: response,
      headers: {
        "Content-Type": "application/json",
      },
      cookies: [
        {
          name: "jid",
          value: refreshToken.toString(),
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
          httpOnly: true,
        },
      ],
    }
  } catch (error) {
    console.log("ERROR OCCURED --> ", error)
    context.res = {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: { message: error.message },
    }
  }
}

export default httpTrigger
