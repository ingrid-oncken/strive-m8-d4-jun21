import jwt from "jsonwebtoken"
import createHttpError from "http-errors"
import UserModel from "../users/schema.js"

export const JWTAuthenticate = async user => {
  // 1. given the user the function generates access and refresh token
  const accessToken = await generateJWT({ _id: user._id })
  const refreshToken = await generateRefreshJWT({ _id: user._id })

  // 2. Save refresh token in db
  user.refreshToken = refreshToken
  await user.save()

  // 3. Return tokens
  return { accessToken, refreshToken }
}

const generateJWT = payload =>
  new Promise((resolve, reject) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" }, (err, token) => {
      if (err) reject(err)
      else resolve(token)
    })
  )

export const verifyJWT = token =>
  new Promise((res, rej) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) rej(err)
      else res(decodedToken)
    })
  )

const generateRefreshJWT = payload =>
  new Promise((resolve, reject) =>
    jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "1 week" }, (err, token) => {
      if (err) reject(err)
      else resolve(token)
    })
  )

const verifyRefreshJWT = token =>
  new Promise((res, rej) =>
    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decodedToken) => {
      if (err) rej(err)
      else res(decodedToken)
    })
  )

// generateJWT({})
//   .then(token => console.log(token))
//   .catch(err => console.log(err))

// const token = await generateJWT({})

export const verifyRefreshAndGenerateTokens = async actualRefreshToken => {
  // 1. Check the validity (exp date and integrity)
  const decodedRefreshToken = await verifyRefreshJWT(actualRefreshToken)

  // 2. If the token is valid we are going to check if it is in db
  const user = await UserModel.findById(decodedRefreshToken._id)

  if (!user) throw createHttpError(404, "User not found")

  // 3. If we find the token we need to compare it to the actualRefreshToken
  if (user.refreshToken && user.refreshToken === actualRefreshToken) {
    // 4. If everything is fine we are going to generate a new pair of tokens (and we are storing new refreshtoken in db)

    const { accessToken, refreshToken } = await JWTAuthenticate(user)

    // 5. Return the tokens
    return { accessToken, refreshToken }
  } else throw createHttpError(401, "Refresh token not valid!")
}
