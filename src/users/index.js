import express from "express"
import createHttpError from "http-errors"

import UserModel from "./schema.js"
import { JWTAuthMiddleware } from "../auth/token.js"
import { adminOnlyMiddleware } from "../auth/admin.js"
import { JWTAuthenticate, verifyRefreshAndGenerateTokens } from "../auth/tools.js"

const usersRouter = express.Router()

usersRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = new UserModel(req.body)
    const { _id } = await newUser.save()
    res.send({ _id })
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const users = await UserModel.find()
    res.send(users)
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    console.log(req.user)
    res.send(req.user)
  } catch (error) {
    next(error)
  }
})

usersRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    req.user.name = "John"
    await req.user.save()

    res.send()
  } catch (error) {
    next(error)
  }
})

usersRouter.delete("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    await req.user.deleteOne()

    res.send()
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/googleLogin") // This endpoint receives Google login requests from our FE and redirects them to Google

usersRouter.get("/googleRedirect") // This endpoint receives the response from Google

usersRouter.get("/:id", JWTAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  try {
    const users = await UserModel.findById(req.params.id)
    res.send(users)
  } catch (error) {
    next(error)
  }
})

usersRouter.post("/login", async (req, res, next) => {
  try {
    // 1. Get email and password from req.body
    const { email, password } = req.body

    // 2. Verify credentials
    const user = await UserModel.checkCredentials(email, password)

    if (user) {
      // 3. If credentials are ok we are going to generate access token and refresh token
      const { accessToken, refreshToken } = await JWTAuthenticate(user)

      // 4. Send token back as a response
      res.send({ accessToken, refreshToken })
    } else {
      next(createHttpError(401, "Credentials are not ok!"))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.post("/refreshToken", async (req, res, next) => {
  try {
    const { currentRefreshToken } = req.body

    // 1. Check the validity of currentRefreshToken (check if it is not expired, check the integrity, check if currentRefreshToken is in db)

    // 2. If everything is fine --> generate a new pair of tokens (accessToken and refreshToken)
    const { accessToken, refreshToken } = await verifyRefreshAndGenerateTokens(currentRefreshToken)

    // 3. Send tokens back as a response
    res.send({ accessToken, refreshToken })
  } catch (error) {
    next(error)
  }
})

usersRouter.post("/logout", JWTAuthMiddleware, async (req, res, next) => {
  try {
    req.user.refreshToken = null
    await req.user.save()
    res.send()
  } catch (error) {
    next(error)
  }
})

// usersRouter.patch("/:id/role", JWTAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
//   try {
//     const user = await UserModel.findByIdAndUpdate(req.params.id, {
//       role: req.body.role,
//     })
//     res.send(user)
//   } catch (error) {}
// })

export default usersRouter
