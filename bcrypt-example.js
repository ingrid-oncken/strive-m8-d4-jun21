import bcrypt from "bcrypt"

const plainPW = "abc"

const numberOfRounds = 10 // the algorithm will be executed 2^numberofrounds times --> 11 means 2^11=2048

console.time("bcrypt")
const hash = bcrypt.hashSync(plainPW, numberOfRounds) // Bcrypt adds SALT to password --> hash("5TEVW9W0ghmsBNdi2"+ plainPW)
console.log("HASH: ", hash) // $2b$10$5TEVW9W0ghmsBNdi2CIdleis1N6X/tcsO6TH.lslLUSnSk9qr8v16
console.timeEnd("bcrypt")

const isOk = bcrypt.compareSync("abc", hash) // hash("5TEVW9W0ghmsBNdi2"+"abc") --> compare the two hashes --> yes or no

console.log("Do they match? ", isOk)
