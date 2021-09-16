const express = require("express");
const router = express.Router();

const {
  getSnippetList,
  getSnippet,
  deleteSnippet,
  createSnippet,
  handleLikeData,
} = require("./controllers/snippets.controllers");

const verifyToken = require("./middlewares/verifyToken");

router.get("/", getSnippetList);

router.get("/:id", getSnippet);

router.delete("/", verifyToken, deleteSnippet);

router.post("/new", verifyToken, createSnippet);

router.patch("/liker/:id", handleLikeData);

module.exports = router;
