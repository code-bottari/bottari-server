require("dotenv").config();

const createError = require("http-errors");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const index = require("./routes/index");
const users = require("./routes/users");
const snippets = require("./routes/snippets");

const app = express();

require("./config/connectMongoose");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
  res.set({
    "Access-Control-Allow-Origin": process.env.CLIENT_URL,
    "Access-Control-Allow-Headers": "content-type",
  });

  next();
});

app.use("/", index);
app.use("/users", users);
app.use("/snippets", snippets);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.send(err);
});

module.exports = app;
