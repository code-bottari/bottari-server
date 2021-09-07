const express = require("express");
const router = express.Router();

const Snippet = require("../models/Snippet");

router.get("/", async (req, res, next) => {
  try {
    const snippetList = await Snippet.find({ language: req.query.language });

    const result = {
      result: "ok",
      snippetList,
    };

    res.send(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
