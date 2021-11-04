import passport from "passport"
import GoogleStrategy from "passport-google-oauth20"

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_OAUTH_ID,
    clientSecret: process.env.GOOGLE_OAUTH_SECRET,
    callbackURL: `${process.env.API_URL}/users/googleRedirect`,
  },
  (accessToken, refreshToken, googleProfile, next) => {
    // callback function executed when Google gives us a response
  }
)

export default googleStrategy
