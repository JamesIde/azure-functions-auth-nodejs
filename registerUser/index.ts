import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import userService from "../services/userService"
import { connectDb } from "../utilities/connectDb"
import { genRefreshToken } from "../utilities/genToken"

/*
Register a user, return an access token and refresh token in a cookie
*/
const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log("HTTP trigger function processed a request.")

  let response: any

  try {
    await connectDb()
    response = await userService.registerUser(context)

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

  // Similar to getUsers, a try catch. On result return, send cookie and return. Need to catch possible errors here
  // Within service, send access token
  // context.res = {
  //     // status: 200, /* Defaults to 200 */
  //     body: responseMessage
  // };
}

export default httpTrigger
