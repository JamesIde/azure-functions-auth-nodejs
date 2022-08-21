import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import userService from "../services/userService"
const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log("HTTP trigger function processed a request. HELLO UPDATED")

  let result: any
  try {
    result = await userService.getUsers(context)

    context.res = {
      status: 200,
      body: result,
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
