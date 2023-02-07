const User = require("../models/user.js");
const BloodSampleInfo = require("../models/bloodSample.js");
const ReqBloodInfo = require("../models/requestBloodInfo.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
let saltRound = 10;

// Register a user
exports.signUp = (req, res) => {
  let name = req.body.userName;
  let email = req.body.email;
  let password = req.body.password;
  let type = req.body.type;

  bcrypt.genSalt(saltRound, (err, newSalt) => {
    bcrypt.hash(password, newSalt, async (err, result) => {
      if (err) {
        console.log(err, "error in hashing password");
      } else {
        try {
          let user = await new User({
            name,
            email,
            password: result,
            userType: type,
          });
          user.save().then(() => {
            console.log(user, "user created");
            res.status(200).json({ message: "User Created" });
          });
        } catch (error) {
          console.log(error, "error in creating user");
          res.status(403).json({ message: "User Not Created" });
        }
      }
    });
  });
};

function generateTokenID(id) {
  return jwt.sign(id, process.env.TOKEN_SECRET);
}

// sign in for both receiver and hospital
exports.signin = (req, res) => {
  //   console.log(req.body);
  let email = req.body.email;
  let password = req.body.password;

  User.find({ email: `${email}` }).then((user) => {
    // console.log(user);
    // if user is found in DB
    if (user.length) {
      //check the password
      bcrypt.compare(password, user[0].password, (error, result) => {
        if (error) {
          console.log(err, "password do not match");
          res.status(403).json({ message: "Password do not match" });
        }
        if (result) {
          let userID = user[0]._id;
          let token = generateTokenID(userID.toString());
          res.status(200).json({ token, message: "User Found" });
        }
      });
    } else {
      console.log("User not found");
      res.status(403).json({ message: "User Not Found" });
    }
  });
};

// Add Blood Sample (ONLY FOR HOSPITAL)
exports.addBloodSample = (req, res) => {
  //   console.log(req.user);
  //   console.log(req.body);
  let donorName = req.body.donorName;
  let donorAge = req.body.donorAge;
  let sex = req.body.sex;
  let bloodGroup = req.body.bloodGroup;
  //check whether user is hospital or receiver
  if (req.user.userType == "Hospital") {
    let bloodSample = new BloodSampleInfo({
      donorName,
      donorAge,
      sex,
      bloodGroup,
      hospitalID: req.user._id,
    });

    bloodSample
      .save()
      .then(() => {
        // console.log("blood created");
        res.status(200).json({ bloodSample, message: "Blood Sample created" });
      })
      .catch((err) => {
        // console.log(err, "error in creating blood sample");
        res.status(403).json({ message: "Blood Sample not created" });
      });
  } else {
    res.status(401).json({ message: "Unauthorized Access" });
  }
};

// edit the blood sample ( ONLY FOR HOSPITAL )
exports.editBloodSample = (req, res) => {
  //   console.log(req.body);
  //   console.log(req.user);
  let bloodSampleId = req.body._id;
  let updatedDonorName = req.body.donorName;
  let updatedDonorAge = req.body.donorAge;
  let updatedSex = req.body.sex;
  let updatedBloodGroup = req.body.bloodGroup;

  // Check the user is hospital of receiver
  if (req.user.userType == "Hospital") {
    BloodSampleInfo.findById(bloodSampleId).then((sample) => {
      //   console.log(sample, "sample found");

      // check whether that blood sample is from the respective hospital
      if (sample.hospitalID == req.user._id.toString()) {
        sample.donorName = updatedDonorName;
        sample.donorAge = updatedDonorAge;
        sample.sex = updatedSex;
        sample.bloodGroup = updatedBloodGroup;

        return sample
          .save()
          .then((updatedSample) => {
            //   console.log("Product updated");
            res
              .status(200)
              .json({ updatedSample, message: "Blood Sample Info Updated" });
          })
          .catch((err) => {
            //   console.log(err, "error in saving updating sample");
            res.status(403).json({ message: "Blood Sample Not updated" });
          });
      } else {
        res.status(401).json({ message: "Unauthorized Access" });
      }
    });
  } else {
    res.status(401).json({ message: "Unauthorized Access" });
  }
};

// remove a blood sample ( ONLY FOR HOSPITAL )
exports.deleteBloodSample = (req, res) => {
  let sampleID = req.body._id;
  if (req.user.userType == "Hospital") {
    BloodSampleInfo.findById(sampleID)
      .then((sample) => {
        if (sample.hospitalID == req.user._id.toString()) {
          BloodSampleInfo.findByIdAndDelete(sampleID, function (err) {
            if (err) {
              console.log(err);
              res.status(403).json({ message: "Blooad Sample Not Deleted" });
            }
            res.status(200).json({ message: "Blood Sample Deleted" });
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(403).json({ message: "Sample Not Found" });
      });
  }
};

// GET all the blood samples from all hospital
exports.getAllBloodSample = (req, res) => {
  BloodSampleInfo.find()
    .then((result) => {
      // console.log(result, "this is all blood sample");
      res.status(200).json({ result });
    })
    .catch((err) => {
      console.log(err, "error in fetching data from db");
      res.status(401).json({ message: "Internal Error" });
    });
};

//  receivers requesting blood from hospital
exports.requestBloodSample = async (req, res) => {
  let bloodID = req.body._id;
  let receiversID = req.user._id;

  try {
    // Find the hospital ID from Blood sample
    let bloodSample = await BloodSampleInfo.findById(bloodID);
    if (!bloodSample) {
      res.status(403).json({ message: "Blood Sample Not Avail" });
    }

    let hospitalID = bloodSample.hospitalID;

    let request = await ReqBloodInfo.create({
      bloodID,
      receiversID,
      hospitalID,
    });

    res.status(200).json({ request, message: "Request Sent To Hospital" });
  } catch (error) {
    res.status(403).json({ message: "Request not generated" });
  }
};

// list of all the user request blood by respective bank
exports.getUserList = async (req, res) => {
  try {
    let userList = await ReqBloodInfo.find({ hospitalID: req.user._id });
    res.status(200).json({ userList });
  } catch (error) {
    console.log(error);
  }
};
