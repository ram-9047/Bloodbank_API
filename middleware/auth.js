const User = require("../models/user.js");
const jwt = require("jsonwebtoken");

exports.authenticate = (req, res, next) => {
  try {
    const token = req.header("authorization");
    const userId = jwt.verify(token, process.env.TOKEN_SECRET);

    User.find({ _id: userId })
      .then((user) => {
        req.user = user[0];
        next();
      })
      .catch((err) => {
        // console.log(err, "error in user auth");
        res.status(403).json({ message: "User not found" });
      });
  } catch (error) {
    // console.log(error, "error in authentication");
    res.status(401).json({ message: "Unauthorized access" });
  }
};
