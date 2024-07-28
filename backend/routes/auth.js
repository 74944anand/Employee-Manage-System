const express = require("express");
const router = express.Router();
const { errorWrapper } = require("../utils/error");
const userController = require("../controller/auth");
const { loginValidation, registerUser } = require("../validation/auth");
const { validateError } = require("../utils/validateError");
const { checkAuth } = require("../middleware/checkAuth");
// const authController = require('../controller/auth')
// const passport = require('passport')

router.post(
  "/login",
  loginValidation,
  validateError,
  errorWrapper(userController.login)
);
router.post(
  "/register",
  registerUser,
  validateError,
  errorWrapper(userController.register)
);
router.get("/logout", checkAuth, errorWrapper(userController.logout));

module.exports = router;
