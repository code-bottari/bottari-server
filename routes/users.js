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

module.exports = router;
