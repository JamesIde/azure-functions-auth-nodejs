import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { connectDb } from "../utilities/connectDb"
import { genRefreshToken } from "../utilities/genToken"
import userService from "../services/userService"

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log("HTTP trigger function processed a request.")
  let response: any

  try {
    await connectDb()
    response = await userService.refreshAccessToken(context)

    // User created, generate the refresh token for cookie
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
