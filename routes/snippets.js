const express = require("express");
const router = express.Router();

const {
  getSnippetList,
  getSnippet,
  deleteSnippet,
  createSnippet,
} = require("./controllers/snippets.controllers");

const verifyToken = require("./middlewares/verifyToken");

router.get("/", getSnippetList);

router.get("/:id", getSnippet);

router.delete("/", verifyToken, deleteSnippet);

router.post("/new", createSnippet);

module.exports = router;
