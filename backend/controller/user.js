const userService = require("../service/user");
const response = require("../utils/response");

exports.getData = async (req, res) => {
  const result = await userService.getData(req.query);
  if (result.success) {
    return response.ok(res, { ...result });
  } else {
    return response.noData(res, { ...result });
  }
};

exports.getDataById = async (req, res) => {
  const { id } = req.params;
  const result = await userService.getDataById(id);
  if (result.success) {
    return response.ok(res, { ...result });
  } else {
    return response.noData(res, { ...result });
  }
};

exports.addData = async (req, res) => {
  const result = await userService.addData(req.body);
  if (result.success) {
    return response.created(res, { ...result });
  } else {
    return response.badRequest(res, { ...result });
  }
};

exports.addBulkData = async (req, res) => {
  const result = await userService.addBulkData(req.body);
  if (result.success) {
    return response.created(res, { ...result });
  } else {
    return response.badRequest(res, { ...result });
  }
};

exports.updateDataById = async (req, res) => {
  const { id } = req.params;
  const result = await userService.updateDataById(id, req.body);
  if (result.success) {
    return response.ok(res, { ...result });
  } else {
    return response.noData(res, { ...result });
  }
};

exports.deleteDataById = async (req, res) => {
  const { id } = req.params;
  const result = await userService.deleteDataById(id);
  if (result.success) {
    return response.deleted(res, { ...result });
  } else {
    return response.noContent(res, { ...result });
  }
};

exports.restoreDataById = async (req, res) => {
  const { id } = req.params;
  const result = await userService.restoreDataById(id);
  if (result.success) {
    return response.ok(res, { ...result });
  } else {
    return response.noData(res, { ...result });
  }
};

exports.tempUploadExcel = async (req, res) => {
  const typeFile =
    req.files.Type && req.files.Type[0].path ? req.files.Type[0].path : "";
  if (typeFile) {
    const result = await userService.dumpExcelDataInTemp(typeFile);
    if (result.success) {
      return response.created(res, { ...result });
    } else {
      return response.badRequest(res, { ...result });
    }
  }
};

exports.userList = async (req, res) => {
  const result = await userService.readAllUser();
  if (result.success) {
    return response.ok(res, { ...result });
  } else {
    return response.noData(res, { ...result });
  }
};
