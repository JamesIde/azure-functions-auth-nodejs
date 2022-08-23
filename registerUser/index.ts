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
    console.log("REFRESH TOKEN --> ", refreshToken)
    context.res = {
      status: 200,
      body: response,
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
