const db = require("../models");
const { QueryTypes } = require("sequelize");
const sequelize = db.sequelize;
const ExcelJS = require("exceljs");
const fs = require('fs').promises;
const path = require("path");
const moment = require("moment");
const Op = db.Sequelize.Op;
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const XLSX = require('xlsx');
const fs1 = require('fs')

exports.userReport = async () => {
  const userReports = await sequelize.query(
    `
    SELECT
    "u"."first_name",
    "u"."id",
    SUM(cc.amount) AS "total_amount"
FROM
    public."user" "u"
JOIN "userAccount" "ua" ON "ua"."user_id" = "u"."id"
JOIN "ccDetails" "cc" ON "ua"."account_id" = "cc"."accountId"
where "u"."deletedAt" is null and "ua"."deletedAt" is null
GROUP BY
    "u"."first_name",
    "u"."id"
    `,
    { type: QueryTypes.SELECT }
  );
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");

  const headers = Object.keys(userReports[0]);
  worksheet.addRow(headers);
  userReports.forEach((row) => {
    const values = headers.map((header) => row[header]);
    worksheet.addRow(values);
  });
  const outputFile = "userReports.xlsx";

  let resultPath = path.join(
    "public/upload/userReports",
    outputFile
  );
  let base_url = process.env.BASE_URL
    ? process.env.BASE_URL
    : "http://127.0.0.1:3000";
  const finalPath = `${base_url}/upload/userReports/${outputFile}`;
  await workbook.xlsx.writeFile(resultPath);
  if (resultPath) {
    return { success: true, message: "User Report Created", data: finalPath };
  } else {
    return {
      success: false,
      message: "User Report Not Created",
      data: finalPath,
    };
  }
};

exports.approverReportDownload = async () => {
  const approverData = await sequelize.query(
    `SELECT
    "u"."first_name" AS "user",
    "a"."first_name" AS "approver",
    SUM(CASE WHEN cc.approval_status = 'PENDING' THEN cc.amount ELSE 0 END) AS "pending_amount",
    SUM(CASE WHEN cc.approval_status = 'APPROVED' THEN cc.amount ELSE 0 END) AS "approved_amount",
    SUM(CASE WHEN cc.approval_status = 'REJECTED' THEN cc.amount ELSE 0 END) AS "rejected_amount",
    SUM(cc.amount) AS "total_amount"
FROM
    public."approverUser" "au"
JOIN
    "userAccount" "ua" ON "au"."user_id" = "ua"."user_id"
JOIN
    "accountDetails" "ad" ON "ua"."account_id" = "ad"."id"
JOIN
    "ccDetails" "cc" ON "ad"."id" = "cc"."accountId"
JOIN
    "user" "u" ON "ua"."user_id" = "u"."id"
JOIN
    "user" "a" ON "au"."approver_id" = "a"."id"
where au."deletedAt" is null AND ua."deletedAt" is null AND ad."deleted_at" is null AND u."deletedAt" is null
GROUP BY
    "u"."first_name", "a"."first_name"";
    `,
    { type: QueryTypes.SELECT }
  );
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");

  const headers = Object.keys(approverData[0]);

  // Add headers to the worksheet
  worksheet.addRow(headers);

  // Add data to the worksheet
  approverData.forEach((row) => {
    const values = headers.map((header) => row[header]);
    worksheet.addRow(values);
  });

  const outputFile = "approverReport.xlsx";

  let resultPath = path.join(
    __dirname,
    "../public/upload/approverReports",
    outputFile
  );
  let base_url = process.env.BASE_URL
    ? process.env.BASE_URL
    : "http://127.0.0.1:3000";
  const finalPath = `${base_url}/upload/approverReports/approverReport.xlsx`;
  await workbook.xlsx.writeFile(resultPath);
  if (resultPath) {
    return {
      success: true,
      message: "Approver Report Created",
      data: finalPath,
    };
  } else {
    return {
      success: false,
      message: " Approver Report Not Created",
      data: finalPath,
    };
  }
};

exports.userReportDetails = async (query) => {
  const {startDate, endDate}= query;
  const userReportsDetails = await sequelize.query(`
    SELECT
    "u"."first_name",
    "u"."id",
    SUM(cc.amount) AS "total_amount"
FROM
    public."user" "u"
JOIN "userAccount" "ua" ON "ua"."user_id" = "u"."id"
JOIN "ccDetails" "cc" ON "ua"."account_id" = "cc"."accountId"
where u."deletedAt" is null AND "ua"."deletedAt" is null
${startDate && endDate ? ` AND "cc"."date" BETWEEN '${moment(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ss.SSS Z")}' AND '${moment(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss.SSS Z")}'` : ''}

GROUP BY
    "u"."first_name",
    "u"."id"
ORDER BY
    "u"."first_name"
    `,
    { type: QueryTypes.SELECT }
  );

  if (userReportsDetails) {
    return {
      success: true,
      message: "User Details Found",
      data: userReportsDetails,
    };
  } else {
    return {
      success: false,
      message: "User Details Not Found ",
      data: userReportsDetails,
    };
  }
};

exports.approverReportDetails = async (query) => {
  const {startDate, endDate} = query;
  const approverDetails = await sequelize.query(
    `SELECT
    "a"."id",
    "a"."first_name" AS "approver",
    SUM(CASE WHEN cc.approval_status = 'PENDING' THEN cc.amount ELSE 0 END) AS "pending_amount",
    SUM(CASE WHEN cc.approval_status = 'APPROVED' THEN cc.amount ELSE 0 END) AS "approved_amount",
    SUM(CASE WHEN cc.approval_status = 'REJECTED' THEN cc.amount ELSE 0 END) AS "rejected_amount",
    SUM(CASE WHEN cc.amount is not null THEN cc.amount ELSE 0 END )  AS "total_amount"
FROM
    public."approverUser" "au"
LEFT JOIN
    "userAccount" "ua" ON "au"."user_id" = "ua"."user_id"
LEFT JOIN
    "accountDetails" "ad" ON "ua"."account_id" = "ad"."id"
LEFT JOIN
    "ccDetails" "cc" ON "ad"."id" = "cc"."accountId"
INNER JOIN
    "user" "a" ON "au"."approver_id" = "a"."id"
    where au."deletedAt" is null AND ua."deletedAt" is null AND ad."deleted_at" is null AND a."deletedAt" is null
     ${startDate && endDate ? `AND "cc"."date" BETWEEN '${moment(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ss.SSS Z")}' AND '${moment(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss.SSS Z")}'` : ''}
  
GROUP BY
    "a"."id", "a"."first_name"
ORDER BY
    "a"."first_name" ;

`,
    { type: QueryTypes.SELECT }
  );

  if (approverDetails) {
    return {
      success: true,
      message: "Approver Data Found",
      data: approverDetails,
    };
  } else {
    return {
      success: false,
      message: " Approver Data Not Found"
        };
  }
};


exports.approverReportDetailsById = async (id,query) => {
  const {startDate, endDate}= query
  const result = await sequelize.query(
    `
 SELECT "user"."id","approverUser"."approver_id", "user"."first_name" AS "userName", "accountDetails"."account_number",
SUM("ccDetails"."amount") AS "total_amount", MAX("ccDetails"."updatedAt") AS "latest_updatedAt"
FROM "approverUser"
JOIN "user" ON "approverUser"."user_id" = "user"."id"
JOIN "userAccount" ON "user"."id" = "userAccount"."user_id"
JOIN "accountDetails" ON "userAccount"."account_id" = "accountDetails"."id"
JOIN "ccDetails" ON "accountDetails"."id" = "ccDetails"."accountId"
WHERE "approverUser"."approver_id" = ${id} ${startDate && endDate ? `AND "ccDetails"."date" BETWEEN '${moment(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ss.SSS Z")}' AND '${moment(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss.SSS Z")}'` : ''}
GROUP BY "user"."id", "approverUser"."approver_id","user"."first_name", "accountDetails"."account_number";
  `,
    { type: QueryTypes.SELECT }
  );

  if (result) {
    return { success: true, message: "Approver Details Found", data: result };
  } else {
    return {success: false, message: "Approver Details Not Found" };
  }
};


exports.userRecordByUserId = async (id,query) => {
  let userRecords;
  const {startDate, endDate}= query;
  if (query.excel) {              //If excel is true then it will give the link to download the data in excel format 
    result = await sequelize.query(
     ` SELECT
      "u"."id",
      "ad"."account_number",
      "cc"."note_merchant_name",
      "cc"."date" AS "date", 
      "cc"."amount",
      "cc"."approval_status" as "status"
  FROM
      public."approverUser" "au"
  JOIN "userAccount" "ua" ON "au"."user_id" = "ua"."user_id"
  JOIN "accountDetails" "ad" ON "ua"."account_id" = "ad"."id"
  JOIN "ccDetails" "cc" ON "ad"."id" = "cc"."accountId"
  JOIN "user" "u" ON "ua"."user_id" = "u"."id"
  WHERE 
      "au"."deletedAt" IS NULL AND "u"."id"=${id}   
      ${startDate && endDate ? `AND "cc"."date" BETWEEN '${moment(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ss.SSS Z")}' AND '${moment(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss.SSS Z")}'` : ''}
  GROUP BY
      "u"."id",
      "cc"."note_merchant_name",
      "cc"."date",
      "cc"."amount",
      "ad"."account_number",
      "cc"."approval_status"
  ORDER BY
      CASE "cc"."approval_status"
          WHEN 'APPROVED' THEN 1
          WHEN 'REJECTED' THEN 2
          WHEN 'PENDING' THEN 3
      END
  `,
      { type: QueryTypes.SELECT }
    );
    if (result && result.length) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
      const headers = Object.keys(
        result[0].dataValues ? result[0].dataValues : result[0]
      );

      worksheet.addRow(headers);

      result.forEach((user) => {
        const values = headers.map((header) => user[header]);
        worksheet.addRow(values);
      });

      let base_url = process.env.BASE_URL
        ? process.env.BASE_URL
        : "http://127.0.0.1:3000";

      const outputFile = `${Date.now()}-${query.status}TransactionReport.xlsx`;
      const resultPath = path.join("public/uploads/reports", outputFile);
      const resultDir = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        "reports"
      );
      const finalPath = `${base_url}/uploads/reports/${outputFile}`;

      await fs.mkdir(resultDir, { recursive: true });

      await workbook.xlsx.writeFile(resultPath);
      return {
        success: true,
        message: `Transaction Report Created`,
        data: finalPath,
      };
    } else {
      return {
        success: false,
        message: `Transaction Report Not Created`,
      };
    }
  } else {
    userRecords = await sequelize.query(
      `
      SELECT
      "u"."id",
      "ad"."account_number",
      "cc"."note_merchant_name",
      "cc"."date" AS "date", 
      "cc"."amount",
      "cc"."approval_status" as "status",
      SUM(cc.amount) OVER(PARTITION BY "cc"."note_merchant_name") AS "total_amount"
  FROM
      public."approverUser" "au"
  JOIN "userAccount" "ua" ON "au"."user_id" = "ua"."user_id"
  JOIN "accountDetails" "ad" ON "ua"."account_id" = "ad"."id"
  JOIN "ccDetails" "cc" ON "ad"."id" = "cc"."accountId"
  JOIN "user" "u" ON "ua"."user_id" = "u"."id"
  WHERE 
      "au"."deletedAt" IS NULL and "u"."id"=${id}
      ${startDate && endDate ? `AND "cc"."date" BETWEEN '${moment(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ss.SSS Z")}' AND '${moment(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss.SSS Z")}'` : ''}
  GROUP BY
      "u"."id",
      "cc"."note_merchant_name",
      "cc"."date",
      "cc"."amount",
      "cc"."approval_status", 
      "ad"."account_number"
  ORDER BY
        CASE "cc"."approval_status"
            WHEN 'APPROVED' THEN 1
            WHEN 'REJECTED' THEN 2
            WHEN 'PENDING' THEN 3
        END
      `,
      { type: QueryTypes.SELECT }
    );
    if (userRecords.length) {
      return { success: true, message: "User Record Found", data: userRecords };
    } else {
      return {
        success: false,
        message: "User Record Not Found",
      };
    }
  }
};


exports.transactionReports = async (query) => {
  let result;
  const queryObj = {
    status: query.status
  };
  if (query.startDate && query.endDate) {
    const startOfDay = moment(query.startDate).startOf("day");
    const endOfDay = moment(query.endDate).endOf("day");
    queryObj.date = {
        [Op.between]: [startOfDay, endOfDay],
    };
  }
  if(query.excel){  //If its true then can get all rejected cc details with account and and rejected by details
    result=  await sequelize.query(rejectedCcDetails(),
    { type: QueryTypes.SELECT }
    );
  }
  //Its for getting rejected data according to rejected count
  else{
    if(query.status == 'REJECTED'){
      queryObj.rejectionCount=query.rejectionCount;
      }
      result = await db.ccDetails.findAll({
        where: queryObj,
        order: [["updatedAt", "DESC"]],
    });
  }
if(result && result.length ){
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");
  const headers = Object.keys(result[0].dataValues?result[0].dataValues:result[0]);
  
  worksheet.addRow(headers);

  result.forEach((user) => {
      const values = headers.map((header) => user[header]);
      worksheet.addRow(values);
  });

  let base_url = process.env.BASE_URL ? process.env.BASE_URL : "http://127.0.0.1:3000";

  const outputFile = `${Date.now()}-${query.status}TransactionReport.xlsx`;
  const resultPath = path.join("public/uploads/reports", outputFile);
  const resultDir = path.join(__dirname, '..', 'public', 'uploads','reports');
  const finalPath = `${base_url}/uploads/reports/${outputFile}`;

  await fs.mkdir(resultDir, { recursive: true });

  await workbook.xlsx.writeFile(resultPath);
  return { success: true, message: `${query.status} Transaction Report Created`, data: finalPath };
}
 else{
  return { success: false, message: `${query.status} Transaction Report Not Created` };
}
};


exports.transactionReportsDetails= async ()=>{
  const rejectedRecords = await sequelize.query(rejectedCcDetails(),
  { type: QueryTypes.SELECT }
  );

  if(!rejectedRecords || rejectedRecords.length==0){
      return{ success : false, message:"Rejected Details Not Available"}
  } 
    return{success: true, message:"Transaction detils found", data: rejectedRecords}
}


function rejectedCcDetails(){
  return `SELECT 
  a.account_holder_name AS Account_Holder,
  a.account_number AS Account_Number,  
  c.vendor_name,
c.date, 
  c.invoice, 
  c.note_merchant_name, 
  c.amount, 
  c.remarks_detailed_expense_desc AS Detailed_Description, 
  c.approval_status, 
  c.approvor_description AS Rejection_Reason,
  CONCAT(u.first_name, ' ', u.last_name) AS Rejected_By
FROM 
  public."ccDetails" AS c
INNER JOIN 
  public."accountDetails" AS a 
ON 
  c."accountId" = a.id
INNER JOIN
  public."user" AS u
ON
  c.approved_by = u.id
WHERE 
  c.approval_status = 'REJECTED' AND a."deleted_at" is null AND u."deletedAt" is null;`
}


exports.csvReports = async (query) => {

  const yardiPropCodes = await db.propCode.findAll({attributes: ["propCode"],where:{businessType:"RE"}})
  const yardiPropCodesArray = yardiPropCodes.map(item => item.propCode);
  
  const gpPropCodes = await db.propCode.findAll({attributes: ["propCode"],where:{businessType:"CJ"}})
  const gpPropCodesArray = gpPropCodes.map(item => item.propCode);
  
  let yardiData = await fetchData(yardiPropCodesArray, query);

  let gpData = await fetchData(gpPropCodesArray, query);

  if (!yardiData.length && !gpData.length) {
    return { success: false, message: `Data Not Found` };
  }

  let yardiFilePath = null;
  let apFilePath = null;
  if (yardiData && yardiData.length) {
    yardiFilePath = await addDataInYardiFile(yardiData);
  }
  if (gpData && gpData.length) {
    apFilePath = await addDataInApFile(gpData);
  }
  return { success: true, message: `csv Report Created`, data: { yardiFilePath, apFilePath } };
}

const concatenateFields = (data) => {
  data.unit=data.unit ? data.unit : ''
  data.propCode = data.propCode ? data.propCode.dataValues.propCode.toUpperCase() : ''
  const fields = [
    data.unit !== null ? data.unit : '|',
    data.worr !== null ? data.worr : '|',
    data.propCode,
    data.remarksDetailedExpenseDesc || '',
    data.invoiceHeader || ''
  ];

  const result = [
    fields.slice(0, 3).join('|'),
    fields.slice(3).join(' ')
  ].join(' ');

  return result.replace(/\|\|/g, '|').trim();
};

const addDataInYardiFile = async (yardiData) =>{
  const fileName = moment(yardiData[0].postMonth, 'MM/YYYY', true).format('MM-YYYY')
  const outputFile = `csv-${fileName}.xlsx`;
  const sheetName = `Sheet-${Math.floor(Math.random() * 10000)}-`+ moment(new Date()).format('MM-DD-YYYY')
  let lastTransactionNumber=0
  let checkFileExist = path.join(process.cwd(), 'public', 'uploads','reports', outputFile)
  const workbook = new ExcelJS.Workbook();
  if(fs1.existsSync(checkFileExist)){
    await workbook.xlsx.readFile(checkFileExist);
    const tabCount = workbook.worksheets.length;
    const sheet = workbook.worksheets[tabCount - 1];
    let lastRowNumber = sheet.rowCount;
    lastTransactionNumber=sheet.getCell(lastRowNumber, 2).value
  }

  const yardiWorksheet = workbook.addWorksheet(sheetName);
  yardiWorksheet.columns = [
    { header: "", key: "type" },
    { header: "", key: "transactionNo" },
    { header: "", key: "vendorCode" },
    { header: "", key: "vendorName" },
    { header: "", key: "date" },
    { header: "", key: "postMonth" },
    { header: "", key: "invoiceHeader" },
    { header: "", key: "invoiceId" },
    { header: "", key: "propCodeId" },
    { header: "", key: "amount" },
    { header: "", key: "glCodeId" },
    { header: "", key: "apAcct" },
    { header: "", key: "cashAcc" },
    { header: "", key: "column" },
    { header: "", key: "description" },
    { header: "", key: "unit" },
    { header: "", key: "displayType" },
    { header: "", key: "expanseType" },
  ]

  let dataBeforeSorting = []
  for (let data of yardiData) {
    if(data.unit){
    const [firstPart, ...rest] = data.unit.dataValues.unit.split('-');
    data.unit = [firstPart, rest.join('-')][1];
    }
    const reportData = {
      transactionNo:data.tran,
      type:data.type,
      vendorCode:data.propCode ? data.propCode.dataValues.propCode == 'sil' ? 'BOA':'SilverCC' : '',
      vendorName:data.propCode ? data.propCode.dataValues.propCode == 'sil' ? 'Bank of America':'SILVER STAR REAL ESTATE LLC' : '',
      date:moment(data.date).format('MM/DD/YYYY'),
      postMonth:data.account ? data.account.dataValues.accountHolderName.startsWith('silver star real e')? moment(data.postMonth, 'MM/YYYY', true).add(1,'month').format('MM/YYYY') :moment(data.postMonth, 'MM/YYYY', true).format('MM/YYYY') : '',
      invoice:data.invoice,
      invoiceHeader:data.invoiceHeader,
      propCodeId:data.propCode ? data.propCode.dataValues.propCode.toUpperCase() : '',
      amount:data.amount,
      glCodeId:data.glCodeId ? data.glCode.dataValues.glCode : '',
      apAcct:"22000-0000",
      cashAcc:"10006-0000",
      unit:data.unit ? ['office', 'bldg', 'shop','ext'].includes(data.unit.toLowerCase()) ? '' : data.unit : '',
      description:concatenateFields(data),//`${data.unit}|${data.worr}|${data.propCodeId}|${data.remarksDetailedExpenseDesc}|${data.invoiceHeader}`,
      displayType:data.unit ? ['office', 'bldg', 'shop','ext'].includes(data.unit.toLowerCase()) ? 'Standard Payable Display Type' : 'SSRE Unit Display Type' : 'Standard Payable Display Type',//data.unit && ['building', 'office', 'shop'].includes(data.unit) ? 'Standard Payable Display Type' : 'SSRE Unit Display Type',
      expanseType:data.glCodeId ? data.glCode.dataValues.glCode.startsWith('7')? 'Capital Expenditure': data.glCode.dataValues.glCode.startsWith('52001')? 'Rent Ready': 'Maintenance Work Order': ''
  }

  dataBeforeSorting.push(reportData)
  }

// Combine sorting by multiple criteria into a single sort function
let dataAfterSorting = sortData(dataBeforeSorting)

// Insert empty objects to indicate different groupings
for (let i = 1; i < dataAfterSorting.length; i++) {
  const prev = dataAfterSorting[i - 1];
  const curr = dataAfterSorting[i];

  if (curr.expanseType !== prev.expanseType ||
      curr.displayType !== prev.displayType ||
      curr.vendorName !== prev.vendorName ||
      curr.invoice !== prev.invoice) {
    dataAfterSorting.splice(i, 0, {});
    i++;
  }
}

// Add transaction numbers and modify invoices
let transactionNumber = lastTransactionNumber+1;
dataAfterSorting.forEach((data, index) => {
  if (Object.keys(data).length) {
    data.transactionNo = transactionNumber;
    data.invoice = `${data.invoice}-${transactionNumber}`;
  } else {
    transactionNumber++;
  }
});

for(let i=0;i<dataAfterSorting.length;i++){
  yardiWorksheet.addRow(dataAfterSorting[i]).commit();
}
autoColumnWidth(yardiWorksheet)

 let base_url = process.env.BASE_URL ? process.env.BASE_URL : "http://127.0.0.1:3000"

 const resultPath = path.join("public/uploads/reports", outputFile);
 const resultDir = path.join(__dirname, "..", "public", "uploads", "reports");
 const finalPath = `${base_url}/uploads/reports/${outputFile}`;

 fs.mkdir(resultDir, { recursive: true });

 workbook.xlsx.writeFile(resultPath)

  return finalPath
}

const addDataInApFile = async (gpData) =>{
  const fileName = moment(gpData[0].postMonth, 'MM/YYYY', true).format('MM-YYYY')
  const outputFile = `Ap-${fileName}.xlsx`;
  const sheetName = `Sheet-${Math.floor(Math.random() * 10000)}-`+ moment(new Date()).format('MM-DD-YYYY')
  let lastTransactionNumber=0
  let checkFileExist = path.join(process.cwd(), 'public', 'uploads','reports', outputFile)
  const workbook = new ExcelJS.Workbook();
  if(fs1.existsSync(checkFileExist)){
  await workbook.xlsx.readFile(checkFileExist);
  const tabCount = workbook.worksheets.length;
  const sheet = workbook.worksheets[tabCount - 1];
  let lastRowNumber = sheet.rowCount;
  lastTransactionNumber=sheet.getCell(lastRowNumber, 1).value.split('-')[1]
  }
  const gpWorksheet = workbook.addWorksheet(sheetName);

  const header = [
    { header: "INV", key: "invoice" },
    { header: "DATE", key: "date" },
    { header: "VENDOR", key: "vendor" },
    { header: "GL CODE", key: "glCode" },
    { header: "STORE NUM", key: "storeNum" },
    { header: "COMMENT", key: "comment" },
    { header: "LARGE COMMENT", key: "largeComment" },
    { header: "LINE AMT", key: "lineAmt" },
    { header: "AMT 1099", key: "amt" },
    { header: "INV HEADER", key: "invHeader" },
    { header: "TRANSACTION TYPE", key: "transactionType" },
    { header: "ENTITY", key: "entity" },
    { header: "PO_APT", key: "poApt" },
    { header: "User Initials", key: "userInitials" },
  ];

  // Add blank first two rows with empty strings to ensure cells are created
  const blankRow = new Array(header.length).fill('');
  gpWorksheet.addRow(blankRow);
  gpWorksheet.addRow(blankRow);

  // Add header row
  gpWorksheet.columns = header;
  gpWorksheet.addRow(header.map(col => col.header));

  for (let i = 1; i < 15; i++) {
    const targetCell = gpWorksheet.getCell(1, i);
    targetCell.value = "";
  }

  let i = Number(lastTransactionNumber)+1;
  for (let data of gpData) {
    const reportData = {
      invoice: data.invoice + '-'+i++,
      date: moment(data.date).date(15).format("MM/DD/YYYY"),
      vendor: "SILVERCC",
      glCode: data.glCodeId ? data.glCode.dataValues.glCode : "",
      storeNum: data.glCodeId ? data.glCode.dataValues.glCode.split("-")[1] : "",
      comment: data.noteMerchantName,
      largeComment: data.remarksDetailedExpenseDesc,
      lineAmt: Math.abs(data.amount),
      invHeader: data.invoiceHeader,
      transactionType: data.amount > 0 ? "Invoice" : "Credit Memo",
      entity: data.propCode ? data.propCode.dataValues.propCode.toUpperCase() : "",
      userInitials: "CK",
    };
    gpWorksheet.addRow(reportData).commit();
  }

  // Style the first three rows in violet
  for (let i = 1; i <= 3; i++) {
    const row = gpWorksheet.getRow(i);
    row.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '002060' }
      };
      if (i === 3) { // Header row
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; // White color and bold text
      }
    });
  }

  autoColumnWidth(gpWorksheet)

  let base_url = process.env.BASE_URL ? process.env.BASE_URL : "http://127.0.0.1:3000";

  const resultDir = path.join(__dirname, "..", "public", "uploads", "reports");
  const apOutputFile = `${Date.now()}-Ap Upload.xlsx`;
  const resultPath = path.join("public/uploads/reports", outputFile);
  const apFilePath = `${base_url}/uploads/reports/${outputFile}`;
  await workbook.xlsx.writeFile(resultPath);

  fs.mkdir(resultDir, { recursive: true });

  return apFilePath;
}

const fetchData = async (propCodes,query) =>{

  const queryObj = {};
  if (query.startDate && query.endDate) {
    const startOfDay = moment(query.startDate).startOf("day");
    const endOfDay = moment(query.endDate).endOf("day");
    queryObj.updatedAt = {
      [Op.between]: [startOfDay, endOfDay],
    };
  }

  queryObj[Op.and] =[
      { propCodeId: { [Op.not]: null } },
      { remarksDetailedExpenseDesc: { [Op.not]: null } },
      { glCodeId: { [Op.not]: null } },
      { '$propCode.prop_code$': { [Op.in]: propCodes } },
      { csvDownloaded:false }
    ]

  const includeArr = [
    {
      model: db.unit,
      attributes: ["unit"],
      as: "unit",
    },
    {
      model: db.propCode,
      attributes: ["propCode"],
      as: "propCode",
    },
    {
      model: db.accountDetails,
      attributes: ["accountHolderName"],
      as: "account",
    },
    {
      model: db.glCode,
      attributes: ["glCode"],
      as: "glCode",
    },
  ];

  let ccDetails = await db.ccDetails.findAll({
    where: queryObj,
    attributes: { exclude: ['deletedAt','updatedAt','accountId','receiptId','status','rejectionReason'] },
    include: includeArr,
    order: [["updatedAt", "DESC"]]  
  })
  const ccIds = ccDetails.map(ccId => ccId.id)
  await db.ccDetails.update({csvDownloaded:true},{where : {id:{[Op.in]:ccIds}}})
  return ccDetails;
}



const sortData = (dataBeforeSorting) => {

//sort data where expanse type present
let storeExpanseTypePresent = [];
let storeExpanseTypeNotPresent = [];

for (let i = 0; i < dataBeforeSorting.length; i++) {
  if (dataBeforeSorting[i].expanseType !== '') {
    storeExpanseTypePresent.push(dataBeforeSorting[i]);
  }else{
    storeExpanseTypeNotPresent.push(dataBeforeSorting[i]);
  }
}

storeExpanseTypePresent.sort((a, b) => {
    if (a.expanseType < b.expanseType) return -1;
    if (a.expanseType > b.expanseType) return 1;
    return 0;
});
dataBeforeSorting=storeExpanseTypePresent.concat(storeExpanseTypeNotPresent)


//sort data display type present
let storeDisplayTypePresent = [];
let storeDisplayTypeNotPresent = [];

for (let i = storeExpanseTypePresent.length; i < dataBeforeSorting.length; i++) { 
  if (dataBeforeSorting[i].displayType !== '') {
    storeDisplayTypePresent.push(dataBeforeSorting[i]);
  }else{
    storeDisplayTypeNotPresent.push(dataBeforeSorting[i]);
  }
}

storeDisplayTypePresent.sort((a, b) => {
    if (a.displayType < b.displayType) return -1;
    if (a.displayType > b.displayType) return 1;
    return 0;
});

dataBeforeSorting = storeExpanseTypePresent.concat(storeDisplayTypePresent.concat(storeDisplayTypeNotPresent))

//sort data vendor name present
let storeVendorNamePresent = [];
let storeVendorNameNotPresent = [];

for (let i = storeExpanseTypePresent.length+storeDisplayTypePresent.length; i < dataBeforeSorting.length; i++) {
  if (dataBeforeSorting[i].VendorName !== '') {
    storeVendorNamePresent.push(dataBeforeSorting[i]);
  }else{
    storeVendorNameNotPresent.push(dataBeforeSorting[i]);
  }
}

storeVendorNamePresent.sort((a, b) => {
    if (a.expanseType < b.expanseType) return -1;
    if (a.expanseType > b.expanseType) return 1;
    return 0;
});

let storePreviousData = []
for(let i=0;i<storeExpanseTypePresent.length+storeDisplayTypePresent.length;i++){
    storePreviousData.push(dataBeforeSorting[i])

}

 dataBeforeSorting = storeVendorNamePresent.concat(storeVendorNameNotPresent)
 dataBeforeSorting=storePreviousData.concat(dataBeforeSorting)


 //sort invoice data
 let storeInvoicePresent = [];
 let storeInvoiceNotPresent = [];

for (let i = storeExpanseTypePresent.length+storeDisplayTypePresent.length+storeVendorNamePresent.length; i < dataBeforeSorting.length; i++) {
  if (dataBeforeSorting[i].VendorName !== '') {
    storeInvoicePresent.push(dataBeforeSorting[i]);
  }else{
    storeInvoiceNotPresent.push(dataBeforeSorting[i]);
  }
}

let storePreviousData2 = []
for(let i=0;i<storeExpanseTypePresent.length+storeDisplayTypePresent.length+storeVendorNamePresent.length;i++){
    storePreviousData2.push(dataBeforeSorting[i])
}
dataBeforeSorting = storeInvoicePresent.concat(storeInvoiceNotPresent)
dataBeforeSorting=storePreviousData2.concat(dataBeforeSorting)

return dataBeforeSorting;

}

const autoColumnWidth = (worksheet)=> {
  worksheet.columns.forEach(function (column, i) {
    let maxLength = 0;
    column["eachCell"]({ includeEmpty: true }, function (cell) {
      var columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    column.width = maxLength < 10 ? 10 : maxLength;
  });
}


exports.rejectedTransactionReport= async(query)=>{
  const {startDate, endDate}= query;

  const result = await db.sequelize.query(
    `SELECT DISTINCT
    us.id,
   CONCAT(us.first_name, ' ', us.last_name) AS User,
   SUM(c.amount)
  FROM 
   public."ccDetails" AS c
  INNER JOIN 
   public."accountDetails" AS a 
  ON 
   c."accountId" = a.id
  INNER JOIN
   public."userAccount" AS ua
  ON
   ua.account_id = a.id
  INNER JOIN
   public."user" AS us
  ON
   us.id = ua.user_id
   WHERE c.approval_status = 'REJECTED' AND ua."deletedAt" is NULL ${startDate && endDate ? `AND c."date" BETWEEN '${moment(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ss.SSS Z")}' AND '${moment(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss.SSS Z")}'` : ''}
  GROUP BY
  us.id
  ORDER BY
  CONCAT(us.first_name, ' ', us.last_name);
    `,
    { type: QueryTypes.SELECT }
  )
  if(result && result.length!=0){
    return {success:true, message:"Data found", data:result}
  }
  else{
    return {success:false, message:"No Data found"}
  }

}

exports.rejectedTransactionReportById=async (id,query)=>{
  const {startDate, endDate}= query;
if(query.excel){     //if excel is true then it will download file in excel format
  const result = await db.sequelize.query(rejectedTransactionReportById(id,startDate,endDate),
    { type: QueryTypes.SELECT }
  )

  if(result && result.length!==0){
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    const headers = Object.keys(result[0].dataValues?result[0].dataValues:result[0]);
    
    worksheet.addRow(headers);
  
    result.forEach((user) => {
        const values = headers.map((header) => user[header]);
        worksheet.addRow(values);
    });
  
    let base_url = process.env.BASE_URL ? process.env.BASE_URL : "http://127.0.0.1:3000";
  
    const outputFile = `${Date.now()}-TransactionReport.xlsx`;
    const resultPath = path.join("public/uploads/reports", outputFile);
    const resultDir = path.join(__dirname, '..', 'public', 'uploads','reports');
    const finalPath = `${base_url}/uploads/reports/${outputFile}`;
  
    await fs.mkdir(resultDir, { recursive: true });
  
    await workbook.xlsx.writeFile(resultPath);
    return { success: true, message: `Transaction Report Created`, data: finalPath };
  }
   else{
    return { success: false, message: `Transaction Report Not Created` };
  }
}
else{
  const result = await db.sequelize.query(rejectedTransactionReportById(id,startDate,endDate)
    ,
    { type: QueryTypes.SELECT }
  )

  if(result && result.length!==0){
    return {success:true, message:"Data found", data:result}
  }
  else{
    return {success:false, message:"No Data found"}
  }
}
  
}

const rejectedTransactionReportById =(id,startDate,endDate)=>{
  return (`SELECT DISTINCT
  us.id,
    CONCAT(us.first_name, ' ', us.last_name) AS User,
    a.account_holder_name AS Account_Holder,
    a.account_number AS Account_Number,  
    c.vendor_name,
    c.date, 
    c.invoice, 
    c.note_merchant_name, 
    c.amount, 
    c.remarks_detailed_expense_desc AS Detailed_Description, 
    c.approval_status, 
    c.approvor_description AS Rejection_Reason,
    CONCAT(u.first_name, ' ', u.last_name) AS Rejected_By
  FROM 
    public."ccDetails" AS c
  INNER JOIN 
    public."accountDetails" AS a 
  ON 
    c."accountId" = a.id
  LEFT JOIN
    public."userAccount" AS ua
  ON
    ua.account_id = a.id
  LEFT JOIN
    public."user" AS us
  ON
    us.id = ua.user_id
  LEFT JOIN
    public."user" AS u
  ON
    c.approved_by = u.id
  WHERE us.id=${id} AND c.approval_status= 'REJECTED' AND ua."deletedAt" is NULL
    ${startDate && endDate ? `AND c."date" BETWEEN '${moment(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ss.SSS Z")}' AND '${moment(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss.SSS Z")}'` : ''};  
  `)
}

exports.accountTransactionReport = async (id,query) => {
  const queryObj = {};
  if (query.startDate && query.endDate) {
    const startOfDay = moment(query.startDate).startOf("day");
    const endOfDay = moment(query.endDate).endOf("day");
    queryObj.createdAt = {
      [Op.between]: [startOfDay, endOfDay],
    };
  }

  queryObj[Op.and] =[
      { propCodeId: { [Op.not]: null } },
      { remarksDetailedExpenseDesc: { [Op.not]: null } },
      { glCodeId: { [Op.not]: null } },
    //  { '$account.account_holder_name$': "silver star real esta" },
        {accountId: id}
    ]

  const includeArr = [//including models according their id in cc transaction details
    {
      model: db.unit,
      attributes: ["unit"],
      as: "unit",
    },
    {
      model: db.propCode,
      attributes: ["propCode"],
      as: "propCode",
    },
    {
      model: db.glCode,
      attributes: ["glCode"],
      as: "glCode",
    },
  ];

  let result = await db.ccDetails.findAll({
    where: queryObj,
    attributes: { exclude: ['id','deletedAt','updatedAt','accountId','rejectionReason','type','tran','receiptId','receiptId','approvedBy','approvedAt','tempId','rejectionCount','csvDownloaded'] },
    include: includeArr,
    order: [["updatedAt", "DESC"]]  
  })

  if(result && result.length!==0){
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sheet1");
    sheet.columns = [
      { header: "Amount", key: "amount" },
      { header: "Vendor Code", key: "vendorCode" },
      { header: "Vendor Name", key: "vendorName" },
      { header: "Date", key: "date" },
      { header: "Post Month", key: "postMonth" },
      { header: "Invoice", key: "invoice" },
      { header: "Notes Merchant Name", key: "noteMerchantName" },
      { header: "GL Code", key: "glCodeId" },
      { header: "Prop Code", key: "propCode" },
      { header: "Remark Detailed Expanse Description", key: "remarksDetailedExpenseDesc" },
      { header: "Inv Header", key: "invoiceHeader" },
      { header: "Unit/Store", key: "unit" },
      { header: "WO/RR", key: "worr" },
    ]

    for (let data of result) {
      const reportData = {
        amount:data.amount,
        vendorCode:data.vendorCode,
        vendorName:data.vendorName,
        date:data.date,
        postMonth:data.postMonth,
        invoice:data.invoice,
        noteMerchantName:data.noteMerchantName,
        glCode:data.glCode?data.glCode.glCode:'',
        propCode:data.propCode?data.propCode.propCode:'',
        remarksDetailedExpenseDesc:data.remarksDetailedExpenseDesc,
        invoiceHeader:data.invoiceHeader,
        unit:data.unit?data.unit.unit:'',
        worr:data.worr
      }
      sheet.addRow(reportData).commit()
    }

    autoColumnWidth(sheet)

    const outputFile = `acc-${Date.now()}.xlsx`;
    let base_url = process.env.BASE_URL ? process.env.BASE_URL : "http://127.0.0.1:3000"
    const resultPath = path.join("public/uploads/reports", outputFile);
    const resultDir = path.join(__dirname, "..", "public", "uploads", "reports");
    const finalPath = `${base_url}/uploads/reports/${outputFile}`;
   
    fs.mkdir(resultDir, { recursive: true });
   
    workbook.xlsx.writeFile(resultPath)
       
    return {success:true, message:"Data found", data:finalPath}
  }
  else{
    return {success:false, message:"No Data found"}
  }}