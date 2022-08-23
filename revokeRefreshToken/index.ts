import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { connectDb } from "../utilities/config/connectDb"
import { IUser, User } from "../utilities/models/userModel"

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  /*
    We accept a user id as a param
    Query the database for that user,
    Update the users token version to increment it by one
    */
  try {
    await connectDb()
    const userId: string = req.query.id || context.req.query.id
    // Find user and update token version
    await User.findOneAndUpdate({ id: userId }, { $inc: { tokenVersion: 1 } })

    context.res = {
      status: 200,
      body: true,
      headers: {
        "Content-Type": "application/json",
      },
    }
  } catch (error) {
    context.res = {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: error,
    }
  }
}

export default httpTrigger
