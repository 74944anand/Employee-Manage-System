const uploadService = require("../service/upload");
const response = require("../utils/response");

exports.getData = async (req, res) => {
  const result = await uploadService.getData(req.query);
  if (result.success) {
    return response.ok(res, { ...result });
  } else {
    return response.noData(res, { ...result });
  }
};
exports.getDataByUserId = async (req, res) => {
  const result = await uploadService.getDataByUserId(
    req.query,
    req.params.userId
  );
  if (result.success) {
    return response.ok(res, { ...result });
  } else {
    return response.noData(res, { ...result });
  }
};

exports.getDataById = async (req, res) => {
  const { id } = req.params;
  const result = await uploadService.getDataById(id);
  if (result.success) {
    return response.ok(res, { ...result });
  } else {
    return response.noData(res, { ...result });
  }
};

exports.addData = async (req, res) => {
  const result = await uploadService.addData(req, res);
  if (result.success) {
    return response.created(res, { ...result });
  } else {
    return response.badRequest(res, { ...result });
  }
};

exports.addBulkData = async (req, res) => {
  const result = await uploadService.addBulkData(req.body);
  if (result.success) {
    return response.created(res, { ...result });
  } else {
    return response.badRequest(res, { ...result });
  }
};

exports.deleteDataById = async (req, res) => {
  const result = await uploadService.deleteDataById(req.params.id);
  if (result.success) {
    return response.deleted(res, { ...result });
  } else {
    return response.noContent(res, { ...result });
  }
};
