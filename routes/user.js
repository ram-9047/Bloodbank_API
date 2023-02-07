const express = require("express");
const userController = require("../controller/user.js");
const auth = require("../middleware/auth.js");
const router = express.Router();

router.post("/signup", userController.signUp);

router.post("/signin", userController.signin);

// ADD blood SAMPLE (only for hospital)
router.post(
  "/addbloodsample",
  auth.authenticate,
  userController.addBloodSample
);

// EDIT blood sample (only for hospital)
router.post(
  "/editbloodsample",
  auth.authenticate,
  userController.editBloodSample
);

// DELETE blood sample (only for hospital)
router.post(
  "/deletebloodsample",
  auth.authenticate,
  userController.deleteBloodSample
);

// GET all blood sample ( everyone can access this )
router.get("/getAllSample", userController.getAllBloodSample);

// POST request blood from hospital ( only for receiver)
router.post(
  "/requestBlood",
  auth.authenticate,
  userController.requestBloodSample
);

// GET all the list of blood-requested-user ( only for hospital)
router.get("/requestUserList", auth.authenticate, userController.getUserList);

module.exports = router;
