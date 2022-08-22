import mongoose from "mongoose"

let dbInstance: any
// Export function
export const connectDb = async () => {
  if (!dbInstance) {
    dbInstance = await mongoose.connect(process.env.MONGO_URI, {})
  }

  return dbInstance
}
