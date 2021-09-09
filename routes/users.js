const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const admin = require("firebase-admin");

const User = require("../models/User");

const MESSAGE = require("../constants/messages");
const ERROR = require("../constants/error");

router.get("/check_member", async (req, res, next) => {
  const { EXPIRED_TOKEN, UNEXPECTED_ERROR, OK } = MESSAGE;
  const { AUTH_ID_TOKEN_REVOKED, AUTH_ID_TOKEN_EXPIRED } = ERROR;
  const { idToken } = req.body;

  try {
    const decodeToken = await admin
      .auth()
      .verifyIdToken(idToken, false);

    const { email } = decodeToken;

    const user = await User.findOne({ email });

    const hasUserData = user === null ? false : true;

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

    res.send({ result: MESSAGE.OK });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
