const express = require("express");
const router = express.Router();

const {
  getSnippetList,
  getUserSnippetList,
  getSnippet,
  deleteSnippet,
  createSnippet,
  createComment,
  deleteComment,
} = require("./controllers/snippets.controllers");

const verifyToken = require("./middlewares/verifyToken");

router.get("/", getSnippetList);

router.get("/info/:id", getUserSnippetList);

router.get("/:id", getSnippet);

router.delete("/", verifyToken, deleteSnippet);

router.post("/new", verifyToken, createSnippet);

router.post("/comment", createComment);

router.delete("/comment", deleteComment);

module.exports = router;
