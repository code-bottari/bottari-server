const express = require("express");
const router = express.Router();

const Snippet = require("../models/Snippet");

const MESSAGES = require("../constants/messages");

router.get("/", async (req, res, next) => {
  try {
    const { language } = req.query;
    const snippetList = await Snippet.find({ language });

    const result = {
      result: MESSAGES.OK,
      snippetList,
    };

    res.send(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
