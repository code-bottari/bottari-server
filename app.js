require("dotenv").config();
require("./config/connectMongoose");
require("./config/connectSlack");

const createError = require("http-errors");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const index = require("./routes/index");
const users = require("./routes/users");
const snippets = require("./routes/snippets");

const app = express();

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

app.use((req, res, next) => {
  next(createError(404));
});

app.use((error, req, res, next) => {
  error.result = "error";
  res.status(error.status || 500);
  res.send(error);
});

module.exports = app;
