const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const MESSAGES = require("../constants/messages");
const ERRORS = require("../constants/errors");

const {
  INVALID_REQUEST,
  EXPIRED_TOKEN,
  UNEXPECTED_ERROR,
  OK,
} = MESSAGES;

const {
  AUTH_ID_TOKEN_REVOKED,
  AUTH_ID_TOKEN_EXPIRED,
} = ERRORS;

router.post("/register", async (req, res, next) => {
  const { idToken, nickname, imageUrl } = req.body;

  try {
    if (idToken === undefined || nickname === undefined || imageUrl === undefined) {
      throw createError(422, INVALID_REQUEST);
    }

    const decodedToken = await admin
      .auth()
      .verifyIdToken(idToken);

    if (!decodedToken) {
      throw createError(403, EXPIRED_TOKEN);
    }

    const { email } = decodedToken;

    const user = await User.create({
      email,
      nickname,
      imageUrl,
    });

    const token = jwt.sign(user._id, process.env.SECRET_KEY);

    res
      .cookie("auth", token, {
        maxAge: 1000 * 60 * 60, // hour = milliseconds * seconds * minutes
        httpOnly: true,
      })
      .send({ result: OK });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      next(createError(422, INVALID_REQUEST));

      return;
    }

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

module.exports = router;
