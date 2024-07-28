const express = require("express");
const router = express.Router();
const { errorWrapper } = require("../utils/error");
const userController = require("../controller/user");
const {
  createUser,
  validateUserId,
  updateUser,
} = require("../validation/user");
const { validateError } = require("../utils/validateError");
const { checkPermission } = require("../middleware/checkPermission");
const { checkAuth } = require("../middleware/checkAuth");

router.get(
  "/",
  checkAuth,
  checkPermission,
  errorWrapper(userController.getData)
);
router.get(
  "/list",
  checkAuth,
  checkPermission,
  errorWrapper(userController.userList)
);
router.get(
  "/:id",
  validateUserId,
  validateError,
  checkAuth,
  checkPermission,
  errorWrapper(userController.getDataById)
);
router.post(
  "/",
  createUser,
  validateError,
  checkAuth,
  checkPermission,
  errorWrapper(userController.addData)
);
router.put(
  "/:id",
  updateUser,
  validateError,
  checkAuth,
  checkPermission,
  errorWrapper(userController.updateDataById)
);
router.delete(
  "/:id",
  validateUserId,
  validateError,
  checkAuth,
  checkPermission,
  errorWrapper(userController.deleteDataById)
);
router.put(
  "/restore/:id",
  validateUserId,
  validateError,
  checkAuth,
  checkPermission,
  errorWrapper(userController.restoreDataById)
);

module.exports = router;
