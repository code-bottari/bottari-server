const express = require("express");
const router = express.Router();

const createError = require("http-errors");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const MESSAGES = require("../constants/messages");

const {
  INVALID_TOKEN,
  NOT_FOUND,
  OK,
} = MESSAGES;

router.get("/notification", (req, res, next) => {
  const token = req.cookies.auth;

  try {
    if (token === undefined) {
      throw createError(401, INVALID_TOKEN);
    }

    jwt.verify(token, process.env.SECRET_KEY, async (error, decoded) => {
      const user = await User.find((user) => String(user._id) === decoded.id);

      if (user === undefined) {
        throw createError(404, NOT_FOUND);
      }

      const notifications = user.notificationList.filter((notification) => notification.isChecked === false);

      res.send({ result: OK, notifications });
    });
  } catch (error) {
    next(error);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const { nickname } = req.body;

    await User.create({ email: "이메일", nickname, imageUrl: "url" });

    res.send({ result: OK });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
