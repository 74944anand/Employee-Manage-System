const { body, param } = require("express-validator");

//login
exports.loginValidation = [
  body("email")
    .notEmpty()
    .withMessage("Email must be specified.")
    .isLength({ min: 9, max: 50 })
    .trim()
    .isEmail()
    .withMessage("Email must be a valid email address."),

  body("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 8, max: 15 })
    .withMessage("password must be minimum 8 characters")
    .trim(),
];

exports.registerUser = [
  body("firstName")
    .notEmpty()
    .withMessage("firstName is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("firstName must be minimum 3 chars and maximum 50 chars")
    .matches(/^[a-zA-Z ]+$/)
    .withMessage(
      "firstName must contain alphabets and spaces and not symbol and special characters."
    )
    .trim(),
  body("lastName")
    .notEmpty()
    .withMessage("lastName is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("lastName must be minimum 3 chars and maximum 50 chars")
    .matches(/^[a-zA-Z ]+$/)
    .withMessage(
      "lastName must contain alphabets and spaces and not symbol and special characters."
    )
    .trim(),
  body("mobileNumber")
    .notEmpty()
    .withMessage("mobileNumber is required")
    .isLength({ min: 10, max: 10 })
    .withMessage("mobileNumber must be minimum and maximum 10 number")
    .matches(/^\d+$/)
    .withMessage("Invalid integer format in mobileNumber")
    .trim(),
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isLength({ min: 10, max: 50 })
    .withMessage("email must be minimum 10 chars and maximum 50 chars")
    .isEmail()
    .trim(),

  body("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 8, max: 15 })
    .withMessage("password must be minimum 8 characters")
    .trim(),
];
