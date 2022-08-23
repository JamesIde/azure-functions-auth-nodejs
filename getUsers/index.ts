import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { connectDb } from "../utilities/config/connectDb"
import { isAuth } from "../utilities/helpers/authMiddleware"
import userService from "../services/userService"
const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  let userId: any
  let result: any

  userId = isAuth(req, context)

  if (userId) {
    try {
      await connectDb()
      result = await userService.getUsers(userId)

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
}

export default httpTrigger
