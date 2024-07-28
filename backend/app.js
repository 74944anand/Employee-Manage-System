require("custom-env").env(true);
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const indexRouter = require("./routes/index");
const response = require("./utils/response");
const fs = require("fs");
const cors = require("cors");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//middleware for apiLogger
// app.use(apiLogger);  first implement redis on server then uncomment this

const filePath3 = path.join(
  `${process.cwd()}`,
  `public`,
  `upload`,
  `approverReports`
);
if (!fs.existsSync(filePath3)) {
  fs.mkdirSync(filePath3, { recursive: true });
}

const filePath2 = path.join(
  `${process.cwd()}`,
  `public`,
  `upload`,
  `userReports`
);
if (!fs.existsSync(filePath2)) {
  fs.mkdirSync(filePath2, { recursive: true });
}

const filePath = path.join(
  `${process.cwd()}`,
  `public`,
  `upload`,
  `userReportsForApprover`
);
if (!fs.existsSync(filePath)) {
  fs.mkdirSync(filePath, { recursive: true });
}

app.use("/api", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // if (config.get('env') == 'dev') { winstonlogger.error(err.message, err) }
  response.internalServerError(res, { error: err.message });
});

module.exports = app;
