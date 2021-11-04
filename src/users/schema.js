import mongoose from "mongoose"
import bcrypt from "bcrypt"

const { Schema, model } = mongoose

const UserSchema = new Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "User", enum: ["User", "Admin"] },
  refreshToken: { type: String },
})

UserSchema.pre("save", async function (next) {
  // BEFORE saving the user in db, hash the password
  const newUser = this // this refers to the current user trying to be saved in db
  const plainPW = newUser.password

  if (newUser.isModified("password")) {
    // only if user is modifying the password we are going to use CPU cycles to calculate the hash
    newUser.password = await bcrypt.hash(plainPW, 10) // $2b$10$PXOMR9lZDXjw41yixKxMI.dftovXBgBfYZJvZry9QW8ylTsfioPIu
  }
  next()
})

UserSchema.methods.toJSON = function () {
  // this is executed automatically EVERY TIME express does a res.send

  const userDocument = this // "this" refers to the specific document
  const userObject = userDocument.toObject()
  delete userObject.password // THIS IS NOT GOING TO AFFECT THE DATABASES
  delete userObject.__v
  delete userObject.refreshToken

  return userObject
}

UserSchema.statics.checkCredentials = async function (email, plainPW) {
  // 1. find the user by email
  const user = await this.findOne({ email }) // "this" refers to UserModel

  if (user) {
    // 2. if the user is found we are going to compare plainPW with hashed one
    const isMatch = await bcrypt.compare(plainPW, user.password)
    // 3. Return a meaningful response
    if (isMatch) return user
    else return null // if the pw is not ok I'm returning null
  } else return null // if the email is not ok I'm returning null as well
}

export default model("User", UserSchema)
