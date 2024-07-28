const express = require("express");
const router = express.Router();
const { errorWrapper } = require("../utils/error");
const reportController = require("../controller/reports");
const { checkPermission } = require("../middleware/checkPermission");
const { checkAuth } = require("../middleware/checkAuth");

router.get(
  "/user-report",
  checkAuth,
  checkPermission,
  errorWrapper(reportController.userReport)
);
router.get(
  "/user-report-details/:id",
  checkAuth,
  checkPermission,
  errorWrapper(reportController.userReportById)
);
router.get(
  "/user-report-details",
  checkAuth,
  checkPermission,
  errorWrapper(reportController.userReportData)
);
router.get(
  "/approver-report",
  checkAuth,
  checkPermission,
  errorWrapper(reportController.approverReport)
);
router.get(
  "/approver-report-details",
  checkAuth,
  checkPermission,
  errorWrapper(reportController.approverReportData)
);
router.get(
  "/approver-report-details/:id",
  checkAuth,
  checkPermission,
  errorWrapper(reportController.approverReportById)
);
router.get(
  "/transaction-report",
  checkAuth,
  checkPermission,
  errorWrapper(reportController.transactionReports)
);
router.get(
  "/csv",
  checkAuth,
  checkPermission,
  errorWrapper(reportController.csvReports)
);
router.get(
  "/transaction-report-details",
  checkAuth,
  checkPermission,
  errorWrapper(reportController.transactionReportsDetails)
);
router.get(
  "/rejected-transaction-report",
  checkAuth,
  checkPermission,
  errorWrapper(reportController.rejectedTransactionReport)
);
router.get(
  "/rejected-transaction-report/:id",
  checkAuth,
  checkPermission,
  errorWrapper(reportController.rejectedTransactionReportById)
);
router.get(
  "/account-transaction-report/:id",
  checkAuth,
  checkPermission,
  errorWrapper(reportController.accountTransactionReport)
);

module.exports = router;
