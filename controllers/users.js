const User=require("../models/user.js");

module.exports.renderSignupForm=(req, res) => {
  res.render("user/signup.ejs");
};

module.exports.signUp=async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({
      username,
      email,
    });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }

      req.flash("success", "Welcome to QuestNest");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm=(req, res) => {
  res.render("user/login.ejs");
};

module.exports.loginEffect=async (req, res) => {
  req.flash("success", "Welcome back to QuestNest!");
  let redirectUrl=res.locals.redirectUrl||"/listings";
  res.redirect(redirectUrl);
};

module.exports.logOut=(req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
};