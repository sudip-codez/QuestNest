if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const MongoStore = require('connect-mongo');
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

//router
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


const dbUrl=process.env.ATLASDB_URL;

main()
  .then(console.log("connected to DB"))
  .catch((e) => console.log("ERROR in connecting to DB: ", e));
async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", engine);

const store=MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret: process.env.SECRET,
  },
  touchAfter:24*3600,
});

store.on("error",()=>{
  console.log("ERROR in MONGO SESSION STORE",err);
});

//associating session with our website
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

//ROOT route
// app.get("/", (req, res) => {
//   res.send("I am the root");
// });

//middlewares for session and flash
app.use(session(sessionOptions));
app.use(flash());

//PASSPORT
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//using flash
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

//using the listing route for all /listings requests & review route for all /listings/:id/review requests
app.use("/listings", listingRouter);
app.use("/listings/:id/review", reviewRouter);
app.use("/", userRouter);

app.listen(port, () => {
  console.log("app is listening on port", port);
});

app.get("/demouser", async (req, res) => {
  let fakeUser = new User({
    email: "sudip@gmail.com",
    username: "sud",
  });
  let newUser = await User.register(fakeUser, "hello");
  res.send(newUser);
});

//handling all random(not existing) path requests
app.all("*", (req, res, next) => {
  throw new ExpressError(404, "Page not found!");
});

//error handling middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("listing/error.ejs", { message });
});
