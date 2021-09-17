const express = require("express");
const router = express.Router();

const {
  getSnippetList,
  shareSnippet,
  getUserSnippetList,
  getSnippet,
  deleteSnippet,
  createSnippet,
  handleLikeData,
  createComment,
  deleteComment,
} = require("./controllers/snippets.controllers");

const verifyToken = require("./middlewares/verifyToken");

router.get("/", getSnippetList);

router.get("/info/:id", getUserSnippetList);

router.get("/:id", getSnippet);

router.post("/", shareSnippet);

router.delete("/", verifyToken, deleteSnippet);

router.post("/new", verifyToken, createSnippet);

router.patch("/liker/:id", handleLikeData);

router.post("/comment", createComment);

router.delete("/comment", deleteComment);

module.exports = router;
