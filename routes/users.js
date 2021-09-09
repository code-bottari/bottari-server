const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

const User = require("../models/User");

const MESSAGE = require("../constants/messages");

router.get("/check_member", async (req, res, next) => {
  const { idToken } = req.body;

  try {
    const decodeToken = await admin
      .auth()
      .verifyIdToken(idToken, false);

    if (!decodeToken) {
      throw createError(403, MESSAGE.EXPIRED_TOKEN);
    }

    const { email } = decodeToken;

    const user = await User.findOne({ email });

    const hasUserData = user === null ? false : true;

    res.send({ result: MESSAGE.OK, hasUserData });
  } catch (error) {
    if (error.status) {
      next(error);
      return;
    }

    next({ message: MESSAGE.UNEXPECTED_ERROR });
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
