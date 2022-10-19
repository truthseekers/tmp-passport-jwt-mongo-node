const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { User } = require("../model/user");

const router = express.Router();

router.get("/", async function (req, res, next) {
  try {
    // const user = new User({ email: "zzz@zzz.com", password: "password" });

    // await user.save();

    res.render("home");
    // res.status(200).send("success!");
  } catch (error) {
    console.log("actual error: ", error);
    res.status(400).send("Error. See logs.");
  }
});

router.get("/login", function (req, res, next) {
  console.log("at login route...");
  res.render("login");
});

router.get("/signup", function (req, res, next) {
  res.render("signup");
});

router.post(
  "/signup",
  // function (req, res, next) {
  //   console.log("SIGNUP please");
  //   res.send("hello");
  // }
  passport.authenticate("signup", { session: false }),
  async (req, res, next) => {
    res.json({
      message: "Signup successful",
      user: req.user,
    });
  }
);

// router.post(
//   "/signup",
//   passport.authenticate("signup", { session: false }),
//   async (req, res, next) => {
//     res.json({
//       message: "Signup successful",
//       user: req.user,
//     });
//   }
// );

router.post("/login", async (req, res, next) => {
  console.log("1. ");
  // go find the "login" authentication we created.
  passport.authenticate("login", async (err, user, info) => {
    console.log("NOT 2. ");
    try {
      console.log("3. ");
      if (err || !user) {
        console.log("3a. ");
        const error = new Error("An error occurred.");

        return next(error);
      }
      console.log("4. ");

      req.login(user, { session: false }, async (error) => {
        console.log("5. ");
        if (error) return next(error);
        console.log("6. ");

        const body = { _id: user._id, email: user.email };
        const token = jwt.sign({ user: body }, "TOP_SECRET");
        console.log("token yo: ", token);
        res.set({ Authorization: `Bearer ${token}` });
        res.render("home");
        // return res.json({ token });
      });
    } catch (error) {
      console.log("7. ");
      return next(error);
    }
  })(req, res, next);
});

module.exports = router;

// res.setHeader
// res.set
// res.header
