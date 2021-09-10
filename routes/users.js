const express = require("express");
const router = express.Router();

const User = require("../models/User");

router.post("/register", async (req, res, next) => {
  try {
    const { nickname } = req.body;

    await User.create({ email: "이메일", nickname, imageUrl: "url"});

    res.status(200).send({ result: "ok" });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findOne({ id: req.params });

    const result = {
      result: "ok",
      user,
    };

    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
