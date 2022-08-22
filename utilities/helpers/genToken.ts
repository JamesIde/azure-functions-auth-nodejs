import * as jwt from "jsonwebtoken"

const genAccessToken = (id: string) => {
  return jwt.sign({ id }, process.env.ACCESS_SECRET as string, {
    expiresIn: "15m",
  })
}

const genRefreshToken = (id: string) => {
  return jwt.sign({ id }, process.env.REFRESH_SECRET as string, {
    expiresIn: "7d",
  })
}

export { genAccessToken, genRefreshToken }
