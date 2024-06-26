require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const createError = require("http-errors");

const memberRouter = require("./routes/memberRoutes");
const brandRouter = require("./routes/brandRoutes");
const watchRouter = require("./routes/watchRoutes");
const authRouter = require("./routes/authRoutes");

const app = express();

// Database setup
mongoose
  .connect("mongodb://127.0.0.1:27017/watch-management", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));

app.use(
  cors({
    origin: process.env.URl_FE,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

app.use("/api/v1/members", memberRouter);
app.use("/api/v1/brands", brandRouter);
app.use("/api/v1/watches", watchRouter);
app.use("/api/v1/auth", authRouter);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error =
    req.app.get(process.env.NODE_ENV) === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
