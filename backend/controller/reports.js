const reportService = require("../service/reports");
const response = require("../utils/response");

exports.userReport = async (req, res) => {
  const result = await reportService.userReport(req.query);
  if (result.success) {
    return response.ok(res, { ...result });
  } else {
    return response.noData(res, { ...result });
  }
};

exports.approverReport = async (req, res) => {
  const result = await reportService.approverReportDownload(req.query);
  if (result.success) {
    return response.ok(res, { ...result });
  } else {
    return response.noData(res, { ...result });
  }
};

exports.userReportData = async (req, res) => {
  const result = await reportService.userReportDetails(req.query);
  if (result.success) {
    return response.ok(res, { ...result });
  } else {
    return response.noData(res, { ...result });
  }
};

exports.approverReportData = async (req, res) => {
  const result = await reportService.approverReportDetails(req.query);
  if (result.success) {
    return response.ok(res, { ...result });
  } else {
    return response.noData(res, { ...result });
  }
};

exports.approverReportById = async (req, res) => {
  const result = await reportService.approverReportDetailsById(
    req.params.id,
    req.query
  );
  if (result.success) {
    return response.ok(res, { ...result });
  } else {
    return response.noData(res, { ...result });
  }
};

exports.userReportById = async (req, res) => {
  const result = await reportService.userRecordByUserId(
    req.params.id,
    req.query
  );
  if (result.success) {
    return response.ok(res, { ...result });
  } else {
    return response.noData(res, { ...result });
  }
};

exports.transactionReports = async (req, res) => {
  const result = await reportService.transactionReports(req.query);
  if (result.success) {
    return response.ok(res, { ...result });
  } else {
    return response.noData(res, { ...result });
  }
};

exports.transactionReportsDetails = async (req, res) => {
  const result = await reportService.transactionReportsDetails(req.query);
  if (result.success) {
    return response.ok(res, { ...result });
  } else {
    return response.noData(res, { ...result });
  }
};
exports.csvReports = async (req, res) => {
  const result = await reportService.csvReports(req.query);
  if (result.success) {
    return response.ok(res, { ...result });
  } else {
    return response.noData(res, { ...result });
  }
};

exports.rejectedTransactionReport = async (req, res) => {
  const result = await reportService.rejectedTransactionReport(req.query);
  if (result.success) {
    return response.ok(res, { ...result });
  } else {
    return response.noData(res, { ...result });
  }
};

exports.rejectedTransactionReportById = async (req, res) => {
  const { id } = req.params;
  const result = await reportService.rejectedTransactionReportById(
    id,
    req.query
  );
  if (result.success) {
    return response.ok(res, { ...result });
  } else {
    return response.noData(res, { ...result });
  }
};

exports.accountTransactionReport = async (req, res) => {
  const { id } = req.params;
  const result = await reportService.accountTransactionReport(id, req.query);
  if (result.success) {
    return response.ok(res, { ...result });
  } else {
    return response.noData(res, { ...result });
  }
};
