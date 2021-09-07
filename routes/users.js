const express = require("express");
const router = express.Router();

const User = require("../models/User");

router.post("/register", async (req, res, next) => {
  try {
    const { nickname } = req.body;

    await User.create({ email: "이메일", nickname, imageUrl: "url"});

    res.send({ result: "ok" });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findOne({ id: req.params });
    const { email, nickname, imageUrl, notificationList, subscriberList, theme } = user;

    const result = {
      result: "ok",
      email,
      nickname,
      imageUrl,
      notificationList,
      subscriberList,
      theme,
    };

    res.send(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
