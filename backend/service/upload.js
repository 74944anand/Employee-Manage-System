const db = require("../models");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mainPath = "public/uploads/";
const pagination = require("../utils/pagination");
const { v4: uuidv4 } = require("uuid");

const createFolderIfNotExist = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};
createFolderIfNotExist(mainPath);
createFolderIfNotExist(path.join(mainPath, "excel"));
createFolderIfNotExist(path.join(mainPath, "pdf"));
createFolderIfNotExist(path.join(mainPath, "image"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const pathToStore = path.join(mainPath, req.params.type);
    cb(null, pathToStore); // Specify the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    const fileExtension = file.originalname.split(".").pop();
    cb(null, `${uuidv4()}.${fileExtension}`); // Use a unique filename for each uploaded file
  },
});
const upload = multer({
  storage: storage,
}).array("files", 10);

exports.getDataById = async (id) => {
  const result = await db.upload.findOne({
    where: { id },
    include: [
      {
        model: db.user,
        as: "user",
        attributes: ["id", "email", "firstName", "lastName"],
      },
    ],
  });
  if (result) {
    result.path = result.path.replace("public", "");
    return { success: true, data: result };
  } else {
    return { success: false, data: result, message: "Data Not Found" };
  }
};
exports.addData = async (req, res) => {
  return new Promise((resolve) => {
    upload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return resolve({ success: false, error: err.message }); // return is added in this because even in error data in database was getting uploaded
      } else if (err) {
        return resolve({ success: false, error: err.message });
      }
      let userId = req?.decoded?.id;
      const result = await db.sequelize.transaction(async (t) => {
        const mainResult = await Promise.all(
          req.files.map(async ({ filename, path, mimetype }) => {
            // await db.logger.create({adminId:userId, fileName:filename, filePath:path, success:true })
            const isCcReceipt = req.query.isCcReceipt === "true" ? true : false;
            description = req.body.description;
            userId = req.body.userId ? req.body.userId : userId;
            if (!req.query.isReceiptWallet) {
              //path = path.replace(/^public\//, '') // removed public from start
              return await db.upload.create(
                { userId, filename, path, mimetype, description, isCcReceipt },
                { transaction: t }
              );
            }
          })
        );
        return { success: true, data: mainResult };
      });
      return resolve(result);
    });
  });
};

exports.getData = async (query) => {
  const { isMasterFileDetail } = query;
  const { search, offset, pageSize } = pagination.paginationWithFromTo(
    query.search,
    query.page,
    query.limit
  );
  const queryObj = {};
  if (query.isCcReceipt) {
    queryObj.isCcReceipt = query.isCcReceipt;
  }
  let result;
  if (isMasterFileDetail) {
    //if its true then it will give latest masterfile uploaded data otherwise return all upload file data
    const unfetchedData = await db.upload.findAll({
      where: { description: "unFetchedRecords" },
      limit: 1,
      include: [
        {
          model: db.user,
          as: "user",
          attributes: ["id", "email", "firstName", "lastName"],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });
    const masterfile = await db.upload.findAll({
      where: { description: "masterFile" },
      limit: 2,
      include: [
        {
          model: db.user,
          as: "user",
          attributes: ["id", "email", "firstName", "lastName"],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });
    if (
      unfetchedData &&
      unfetchedData.length &&
      masterfile &&
      masterfile.length
    ) {
      const user = `${masterfile[0].user.firstName} ${masterfile[0].user.lastName}`;
      result = [
        {
          masterFile: masterfile[0].path,
          unFetchedRecords: unfetchedData[0].path,
          updatedBy: user,
          uploadedAt: masterfile[0].createdAt,
        },
      ];
    } else {
      result = [];
    }
  } else {
    result = await db.upload.findAll({
      where: queryObj,
      offset: offset,
      limit: pageSize,
      include: [
        {
          model: db.user,
          as: "user",
          attributes: ["id", "email", "firstName", "lastName"],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });
  }
  if (result && result.length) {
    let count = await db.upload.count({ where: queryObj });
    return { success: true, message: "File Upload Found", data: result, count };
  } else {
    return { success: false, message: "File Upload Not Found", data: result };
  }
};

exports.getDataByUserId = async (query, userId) => {
  const { search, offset, pageSize } = pagination.paginationWithFromTo(
    query.search,
    query.page,
    query.limit
  );
  const queryObj = { userId };
  if (query.isCcReceipt) {
    queryObj.isCcReceipt = query.isCcReceipt;
  }
  const result = await db.upload.findAll({
    where: queryObj,
    offset: offset,
    limit: pageSize,
    include: [
      {
        model: db.user,
        as: "user",
        attributes: ["id", "email", "firstName", "lastName"],
      },
      {
        model: db.ccDetails,
        as: "receiptData",
        attributes: ["receiptId"],
      },
    ],
  });
  if (result && result.length) {
    let count = await db.upload.count({ where: queryObj });
    return { success: true, message: "File Upload Found", data: result, count };
  } else {
    return { success: false, message: "File Upload Not Found", data: result };
  }
};

exports.deleteDataById = async (id) => {
  const result = await db.upload.destroy({ where: { id, isCcReceipt: true } });
  if (result) {
    return { success: true, result, message: "Receipt Deleted" };
  } else {
    return { success: false, result, message: "Error deleting receipt" };
  }
};
