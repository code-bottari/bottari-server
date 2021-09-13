const express = require("express");
const router = express.Router();

const admin = require("firebase-admin");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const {
  UNEXPECTED_ERROR,
  INVALID_REQUEST,
  EXPIRED_TOKEN,
  INVALID_TOKEN,
  NOT_FOUND,
  OK,
  NO_AUTHORITY_TO_ACCESS,
} = require("../constants/messages");

const {
  AUTH_ID_TOKEN_REVOKED,
  AUTH_ID_TOKEN_EXPIRED,
} = require("../constants/errors");

router.get("/notification", (req, res, next) => {
  const token = req.cookies.auth;

  try {
    if (token === undefined) {
      throw createError(401, INVALID_TOKEN);
    }

    jwt.verify(token, process.env.SECRET_KEY, async (error, decoded) => {
      const user = await User.findById(decoded.id);

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
    next(error);
  }
});

router.get("/subscribe/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    const users = await User.find();
    const subscriberList = users.filter((user) => user.subscriberList.indexOf(id) !== -1);

    res.status(200).send({ result: OK, subscriberList });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ id });

    res.status(200).send({ result: OK, user });
  } catch (error) {
    if (error.status) {
      next(error);

      return;
    }

    next({ message: UNEXPECTED_ERROR });
  }
});

router.patch("/:id", async (req, res, next) => {
  const { id : userId } = req.params;
  const { nickname, imageUrl } = req.body;
  const { auth: token } = req.cookies;

  const { _id: decodedId } = jwt.decode(token);

  try {
    if (userId !== decodedId) {
      throw createError(403, NO_AUTHORITY_TO_ACCESS);
    }

    if (nickname === undefined && imageUrl === undefined) {
      throw createError(422, INVALID_REQUEST);
    }

    const toBeUpdated = {};

    nickname && (toBeUpdated.nickname = nickname);
    imageUrl && (toBeUpdated.imageUrl = imageUrl);

    await User.findByIdAndUpdate(userId, toBeUpdated);

    const updatedData = await User.findById(userId);

    res.status(200).send({ result: OK, updatedData });
  } catch (error) {
    if (error.status) {
      next(error);

      return;
    }

    next({ message: UNEXPECTED_ERROR });
  }
});

module.exports = router;
