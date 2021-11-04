import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import listEndpoints from "express-list-endpoints"
import usersRouter from "./users/index.js"

import { unauthorizedHandler, forbiddenHandler, catchAllHandler } from "./errorHandlers.js"

const server = express()
const port = process.env.PORT || 3001

// ******************** MIDDLEWARES *************************+

server.use(cors())
server.use(express.json())

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
