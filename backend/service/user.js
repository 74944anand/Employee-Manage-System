const db = require("../models");
const pagination = require("../utils/pagination");
const ExcelJS = require("exceljs");
const Op = db.Sequelize.Op;
const sequelize = db.sequelize;
const { QueryTypes } = require("sequelize");
const bcrypt = require("bcrypt");

exports.getData = async (query) => {
  const { search, offset, pageSize } = pagination.paginationWithFromTo(
    query.search,
    query.page,
    query.limit
  );
  const queryObj = {};
  if (search) {
    queryObj[Op.or] = [
      { firstName: { [Op.iLike]: "%" + search + "%" } },
      { lastName: { [Op.iLike]: "%" + search + "%" } },
      { username: { [Op.iLike]: "%" + search + "%" } },
      { email: { [Op.iLike]: "%" + search + "%" } },
    ];
  }

  const result = await db.user.findAll({
    where: queryObj,
    offset: offset,
    limit: pageSize,
    paranoid: false,
    include: [
      {
        model: db.userRole,
        as: "userRole",
        attributes: ["roleId"],
      },
      {
        model: db.accountDetails,
        as: "account_id",
        through: {
          attributes: ["accountId"],
        },
      },
    ],
    order: [["updatedAt", "DESC"]],
  });

  // Add vipStatus to each user based on conditions
  const modifiedResult = result.map((user) => {
    // Check if the user has a role with roleId 4
    const hasRoleId4 = user.userRole.some((role) => role.roleId === 4);

    // Determine the vipStatus
    user.isVip = hasRoleId4 ? "--" : user.isVip ? "No" : "Yes";

    return {
      ...user.toJSON(),
    };
  });

  // Custom sort function
  const sortedResult = modifiedResult.sort((a, b) => {
    const vipOrder = { Yes: 1, No: 2, "--": 3 };
    return vipOrder[a.isVip] - vipOrder[b.isVip];
  });
  //Sorting based on deletedAt is null first then deleted users(active first and then inactive)
  sortedResult.sort((a, b) => {
    if (a.deletedAt === null && b.deletedAt !== null) {
      return -1; // `a` comes before `b`
    }
    if (a.deletedAt !== null && b.deletedAt === null) {
      return 1; // `b` comes before `a`
    }
    // If both are null or both are not null, compare the values
    return new Date(a.deletedAt) - new Date(b.deletedAt);
  });

  if (sortedResult && sortedResult.length) {
    let count = await db.user.count({ where: queryObj, paranoid: false });
    return { success: true, message: "User Found", data: sortedResult, count };
  } else {
    return { success: false, message: "User Not Found", data: sortedResult };
  }
};

exports.getDataById = async (id, options) => {
  const result = await db.user.findOne({
    ...options,
    where: { id },
    include: [
      {
        model: db.role,
        as: "role",
      },
    ],
  });
  if (result) {
    return { success: true, message: "User Found", data: result };
  } else {
    return { success: false, message: "User Not Found", data: result };
  }
};

exports.addData = async ({
  firstName,
  lastName,
  username,
  mobileNumber,
  password,
  email,
  roleId,
  isVip,
  approverId,
  accountId,
}) => {
  // const roleData = await db.role.findOne({ where: { id: roleId } });
  // if (!roleData) {
  //   return { success: false, message: "Role Not Found", data: roleData };
  // }
  if (mobileNumber) {
    const uniqueMobile = await db.user.findOne({ where: { mobileNumber } });
    if (uniqueMobile) {
      return { success: false, message: "Mobile number Already Present" };
    }
  }
  const uniqueEmail = await db.user.findOne({ where: { email } });
  if (uniqueEmail) {
    return { success: false, message: "email must be unique" };
  }

  let checkUserEmailPresentInTable = await sequelize.query(
    'SELECT * FROM public."user" WHERE "email" = :email AND "deletedAt" IS NOT NULL',
    {
      replacements: { email },
      type: QueryTypes.SELECT,
    }
  );
  const userId = checkUserEmailPresentInTable.length
    ? checkUserEmailPresentInTable[0].id
    : [];
  if (checkUserEmailPresentInTable.length) {
    await sequelize.query(
      'UPDATE public."user" SET "deletedAt" = NULL WHERE "email" = :email',
      {
        replacements: { email },
        type: QueryTypes.UPDATE,
      }
    );

    if (password) {
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
    }
    const result = await db.user.update(
      { firstName, lastName, username, mobileNumber, password, email, isVip },
      {
        where: {
          email,
        },
      }
    );

    await sequelize.query(
      'UPDATE public."userRole" SET "deletedAt" = NULL WHERE "user_id" = :userId',
      {
        replacements: { userId },
        type: QueryTypes.UPDATE,
      }
    );
    return { success: true, message: "User Added", data: result };
  }

  const result = await db.user.create({
    firstName,
    lastName,
    username,
    mobileNumber,
    password,
    email,
    isVip,
  });
  if (result) {
    let userApproverId;
    if (isVip) {
      userApproverId = approverId ? approverId : result.id;
    } else {
      if (approverId) {
        userApproverId = approverId;
      } else {
        const adminRole = await db.userRole.findOne({ where: { roleId: 1 } });
        if (!adminRole) {
          return { success: false, message: "Admin Role Not Found" };
        }
        const admin = await db.user.findOne({ where: { id: adminRole.id } });
        if (!admin) {
          return { success: false, message: "Admin Not Found" };
        }
        userApproverId = admin.id;
      }
    }
    await db.userRole.create({ userId: result.id, roleId });

    await db.approverUser.create({
      userId: result.id,
      approverId: userApproverId,
      levelId: 1,
    });

    let accounts = [];
    if (accountId && accountId.length) {
      accountId.forEach((ele) => {
        accounts.push({ userId: result.id, accountId: ele });
      });
      await db.userAccount.bulkCreate(accounts);
    }
    return { success: true, message: "User Added", data: result };
  } else {
    return { success: false, message: "User Not Added", data: result };
  }
};

exports.addBulkData = async (data) => {
  const result = await db.user.bulkCreate(data);
  if (result) {
    return { success: true, message: "User Added", data: result };
  } else {
    return { success: false, message: "User Not Added", data: result };
  }
};

exports.updateDataById = async (
  id,
  {
    firstName,
    lastName,
    accountHolderName,
    password,
    username,
    mobileNumber,
    email,
    accountNumber,
    isVip,
    roleId,
    accountId,
  }
) => {
  if (roleId) {
    const roleData = await db.role.findOne({ where: { id: roleId } });
    if (!roleData)
      return { success: false, message: "Role Not Found", data: roleData };
  }
  await db.userAccount.destroy({ where: { userId: id } });
  const user = await db.user.findOne({ where: { id } });
  if (!user) {
    return { success: false, message: "User Not Found", data: user };
  }
  const result = await user.update(
    {
      firstName,
      lastName,
      accountHolderName,
      password,
      username,
      mobileNumber: mobileNumber != undefined ? mobileNumber : null,
      email,
      accountNumber,
      isVip,
    },
    { where: { id } }
  );
  console.log(result);
  let setRole;
  setRole = await db.userRole.update({ roleId }, { where: { userId: id } });
  if (!setRole[0]) {
    //if role is not present for user then create role for user
    setRole = await db.userRole.create({ roleId, userId: id });
  }
  let accounts = [];
  if (accountId && accountId.length) {
    accountId.map((ele) => {
      accounts.push({ userId: id, accountId: ele });
    });
    await db.userAccount.bulkCreate(accounts);
  }
  if (result && setRole) {
    return { success: true, message: "User Updated", data: result };
  } else {
    return { success: false, message: "Data Not updated", data: result };
  }
};

exports.deleteDataById = async (id) => {
  const result = await db.user.destroy({ where: { id } });
  if (result) {
    await db.userAccount.destroy({ where: { userId: id } });
    await db.userRole.destroy({ where: { userId: id } });
    await db.approverUser.destroy({ where: { userId: id } });
    const approverUsers = await db.approverUser.findAll({
      where: { approverId: id },
    });
    await approverUsers.map((user) => {
      db.approverUser.update(
        { approverId: user.userId },
        { where: { userId: user.userId } }
      );
    });
    return { success: true, message: "User Deleted", result };
  } else {
    return { success: false, message: "User Not found", result };
  }
};

exports.restoreDataById = async (id) => {
  const result = await db.user.restore({ where: { id } });
  if (result) {
    return { success: true, message: "User Restored", result };
  } else {
    return { success: false, message: "User Not found", result };
  }
};

async function readDataFromExcel(file) {
  const data = [];
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(file);
  const map = {};

  const worksheet = workbook.getWorksheet("AP Template");
  let headerRow;
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      const values = cell.value;
      if (!values) {
        return;
      }
      if (typeof values !== "string") {
        return;
      }
      if (values.toLowerCase().startsWith("type")) {
        headerRow = rowNumber;
      }
    });
  });
  worksheet.getRow(headerRow).eachCell((cell, colNumber) => {
    const values = cell.value;
    if (!values) {
      return;
    }
    if (typeof values !== "string") {
      return;
    }
    map[values.toLowerCase()] = colNumber;
  });
  const allData = [];
  const rows = worksheet.getRows(4, worksheet.lastRow._number);
  for (const row of rows) {
    const amount = row.getCell(map["amount"]).value;
    if (!amount) {
      continue;
    }
    const rowData = {
      type: row.getCell(map["type"]).value,
      transaction: row.getCell(map["tran #"]).value,
      vendorCode: row.getCell(map["vendor"]).value,
      vendorName: row.getCell(map["vendor name"]).value,
      date: row.getCell(map["date"]).value,
      postMonth: row.getCell(map["postmonth"]).value,
      invoice: row.getCell(map["invoice #"]).value,
      notesMerchantName: row.getCell(map["notes"]).value,
      propCodeEntity: row.getCell(map["prop code"]).value,
      amount,
      apAccount: row.getCell(map["ap acct"]).result
        ? row.getCell(map["ap acct"]).result
        : row.getCell(map["ap acct"]).value,
      offset: row.getCell(map["offset"]).result,
      manualCheck: row.getCell(map["manual check#"]).value,
      remarksDescription: row.getCell(map["remarks"]).value,
      invoiceHeader: row.getCell(map["inv header"]).value,
      unit: row.getCell(map["unit# wo/rr"]).value,
      receipt: row.getCell(map["receipt"]).value,
    };
    allData.push(rowData);
  }

  return allData;
}
exports.dumpExcelDataInTemp = async (file) => {
  let ccExcelData = [];
  try {
    ccExcelData = await readDataFromExcel(file);
  } catch (error) {
    const errMsg = `CC temp file => Failed to process file: ${file}`;
    console.error(errMsg);
    console.error("An error occurred:", error.message);
    logger.error(errMsg, error);
  }

  let result = await db.tempCcDetails.bulkCreate(ccExcelData);
  if (result) {
    return { success: true, message: "Data Added in tempCcDetails", result };
  } else {
    return { success: false, message: "Data Added in tempCcDetails", result };
  }
};

exports.readAllUser = async () => {
  const result = await db.user.findAll({ order: [["updatedAt", "DESC"]] });
  if (result && result.length) {
    return { success: true, message: "User List Found", data: result };
  } else {
    return { success: false, message: "User List Not Found", data: result };
  }
};
