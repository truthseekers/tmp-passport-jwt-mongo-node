const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const { User } = require("../model/user");
const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;

passport.use(
  new JWTstrategy(
    {
      secretOrKey: "TOP_SECRET",
      jwtFromRequest: ExtractJWT.fromUrlQueryParameter("secret_token"),
    },
    async (token, done) => {
      console.log("actually using JwTstrategy: ");
      try {
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.use(
  "signup",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        console.log("Trying to create a user in passport signup....");
        const user = await new User({ email, password });
        await user.save();

        return done(null, user);
      } catch (error) {
        console.log("error in signup thing: ", error);
        done(error);
      }
    }
  )
);

passport.use(
  "login",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      console.log("8?? wahts this even do?");
      try {
        console.log("9?");
        console.log("trying to log in? email: ", email);
        const user = await User.findOne({ email });

        console.log("found user for login: ", user);

        if (!user) {
          console.log("no user...");
          return done(null, false, { message: "User not found" });
        }

        console.log("about to validate");
        const validate = await user.isValidPassword(password);
        console.log("validate: ", validate);

        if (!validate) {
          return done(null, false, { message: "Wrong Password" });
        }

        return done(null, user, { message: "Logged in Successfully" });
      } catch (error) {
        console.log("error in login: ", error);
        return done(error);
      }
    }
  )
);
