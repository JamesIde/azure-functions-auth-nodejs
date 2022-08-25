import mongoose, { Schema } from "mongoose"

// Generate interface for trail
export interface ITrail extends mongoose.Document {
  name: string
  description: string
  length: string
  duration: string
  elevationGain: string
  difficulty: string
  location: string
  country: string
  images: Array<string>
}

// generate schema with ITrail type
const trailSchema: Schema = new Schema<ITrail>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  length: { type: String, required: true },
  duration: { type: String, required: true },
  elevationGain: { type: String, required: true },
  difficulty: { type: String, required: true },
  location: { type: String, required: true },
  country: { type: String, required: true },
  images: [{ type: String, required: true }],
})

// Generate model from schema
export const Trail = mongoose.model<ITrail>("Trail", trailSchema)
