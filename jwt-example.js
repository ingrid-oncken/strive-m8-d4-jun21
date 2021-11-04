import jwt from "jsonwebtoken"

const token = jwt.sign({ _id: "ioj123ioj213oj21" }, "mysup3rscr3t", { expiresIn: "10s" })

console.log(token)

jwt.verify(
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJpb2oxMjNpb2oyMTNvajIyIiwiaWF0IjoxNjM1OTMxMjM2LCJleHAiOjE2MzU5MzEyNDZ9.WzfKXJkar9FuCwtLmtBSZX1ysMSVGg39wogwFNbmjE8",
  "mysup3rscr3t"
)
