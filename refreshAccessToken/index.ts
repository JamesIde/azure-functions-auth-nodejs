import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { connectDb } from "../utilities/config/connectDb"
import userService from "../services/userService"

/*
Refresh the access token by validating the refresh token cookie
*/
const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  let response: any

  try {
    await connectDb()
    response = await userService.refreshAccessToken(context)

    context.res = {
      status: 200,
      body: response,
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
