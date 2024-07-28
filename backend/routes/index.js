const express = require("express");
const router = express.Router();
const permission = require("./permission"); // permission Route
const rolePermission = require("./rolePermission"); // rolePermission Route
const user = require("./user"); // role User
const role = require("./role"); // role Route
const auth = require("./auth");
const reports = require("./reports");

router.use("/auth", auth);
router.use("/permission", permission);
router.use("/role", role);
router.use("/role-permission", rolePermission);
router.use("/user", user);
router.use("/reports", reports);
module.exports = router;
