const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const admin = require("firebase-admin");

const createError = require("http-errors");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const MESSAGES = require("../constants/messages");
const ERRORS = require("../constants/errors");

const {
  EXPIRED_TOKEN,
  UNEXPECTED_ERROR,
  INVALID_TOKEN,
  NOT_FOUND,
  OK,
} = MESSAGES;

const {
  AUTH_ID_TOKEN_REVOKED,
  AUTH_ID_TOKEN_EXPIRED,
} = ERRORS;

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
    
router.get("/check-member", async (req, res, next) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin
      .auth()
      .verifyIdToken(idToken, false);

    const { email } = decodedToken;

    const user = await User.findOne({ email });

    const hasUserData = user !== null;

    res.send({ result: OK, hasUserData });
  } catch (error) {
    const { code } = error;

    if (code === AUTH_ID_TOKEN_REVOKED) {
      next(createError(422, INVALID_TOKEN));

      return;
    }

    if (code === AUTH_ID_TOKEN_EXPIRED) {
      next(createError(401, EXPIRED_TOKEN));

      return;
    }

    next({ message: UNEXPECTED_ERROR });
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const { nickname } = req.body;

    await User.create({ email: "이메일", nickname, imageUrl: "url" });

    res.status(200).send({ result: OK });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ id });

    const result = {
      result: MESSAGES.OK,
      user,
    };

    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
