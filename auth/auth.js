const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
// vs this: var LocalStrategy = require("passport-local");
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

// entire signup flow:
// 1. POST "/signup" is hit with "email" and "password" in the body.
// 1.5 pass through a useless middleware function that I've setup as a test.
// 2. Utilize Passport.js to verify... something? (anyways go into passport.use "signup" definition)
// 3. The "usernameField" passwordField values should match the values in the body. email should be email etc.
// 4. Hit the "verify" callback (defined below) with email, password, and "done" callback.
// 5. enter try {} and create the new User.
// 6. Save the user.
// 7. move to the "pre" save, which uses bcrypt to hash the password, then saves the user with the hashed password instead.
// 8. "pre" 's callback function has a next() so I assume this is something built in so this .pre() thing can be middleware.
// 9. User actually gets saved.
// 10. Call "done" which takes "err" as the first, but if no error, pass "null" as the error. 2nd param is the user.
// ***** What does... done() actually do? I assume this is where the passport magic happens? ****
//////// Sticks some things on the req. like req.login, req.user. are these permanent? Does every request have those now? Or.. Only on routes "using" passport?
///////////// "using passport meaning (see app.js line 32): app.use("/user", passport.authenticate("jwt", { session: false }), secureRoute);"
///////////// See how "secureRoute" is "going through" a passport authentication. idk.
// 11. Go to final middleware, which just sends the json message that the signup was successful.

// ******** Which part of this is the instructions to check a local record? see Michaels msg in Slack. Which part needed this to be a local strategy? *******///
// Note the Failure redirect does not work.

passport.use(
  "signup",
  new localStrategy(
    {
      usernameField: "email", // this is the name of the "key" for the email/username field. In postman use an 'email' key. Or "elephants" etc..
      passwordField: "password",
      // usernameField: "elephant",
      // passwordField: "thesedocssuck",
    },
    async (email, password, done) => {
      console.log("trying to signup again.");

      // Using a try catch may be causing a problem with the failure redirect?
      // try {
      //   console.log(
      //     "Trying to create a user in passport signup....",
      //     email,
      //     password
      //   );
      //   const user = await new User({ email, password });
      //   console.log("new user obj: ", user);
      //   await user.save();
      //   console.log("saved user.");

      //   return done(null, user);
      // } catch (error) {
      //   console.log("error in signup thing: ", error);
      //   done(error, null); // done(err, user, info);
      // }

      // the below works in the sessions version of the app. so why not here?
      // return done(null, false, {
      //   message: "Incorrect username or password.",
      // });

      // done("yikes", null);
    }
  )
);

// Entire LOGIN flow:
// 1. Hit the LOGIN post request with email and password (matching the first "options" object.)
// 2.
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
