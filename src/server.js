import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import listEndpoints from "express-list-endpoints"
import passport from "passport"
import cookieParser from "cookie-parser"
import usersRouter from "./users/index.js"
import GoogleStrategy from "./auth/oauth.js"

import { unauthorizedHandler, forbiddenHandler, catchAllHandler } from "./errorHandlers.js"

const server = express()
const port = process.env.PORT || 3001

// ******************** MIDDLEWARES *************************+
passport.use("google", GoogleStrategy)

server.use(cors({ origin: "http://localhost:3000", credentials: true }))
server.use(express.json())
server.use(cookieParser())
server.use(passport.initialize())

// ******************** ROUTES ******************************

server.use("/users", usersRouter)

// ********************** ERROR HANDLERS *************************

server.use(unauthorizedHandler)
server.use(forbiddenHandler)
server.use(catchAllHandler)

console.table(listEndpoints(server))

mongoose.connect(process.env.MONGO_CONNECTION)

mongoose.connection.on("connected", () => {
  console.log("Mongo connected!")
  server.listen(port, () => {
    console.log(`Server running on port ${port}`)
  })
})
