import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { connectDb } from "../utilities/connectDb"
import { genRefreshToken } from "../utilities/genToken"
import userService from "../services/userService"
/*
Login a user, return an access token and refresh token in a cookie
*/
const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log("HTTP trigger function processed a request.")

  let response: any

  try {
    await connectDb()
    response = await userService.loginUser(context)

    // User created, generate the refresh token for cookie
    const refreshToken = genRefreshToken(response.id)

    context.res = {
      status: 200,
      body: response,
      cookies: [
        {
          name: "jid",
          value: refreshToken,
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
          httpOnly: true,
        },
      ],
    }
  } catch (error) {
    console.log("ERROR OCCURED --> ", error)
    context.res = {
      status: 500,
      body: { message: error.message },
    }
  }
}

export default httpTrigger
