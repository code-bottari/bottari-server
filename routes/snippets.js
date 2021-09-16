const express = require("express");
const router = express.Router();

const {
  getSnippetList,
  shareSnippet,
  getSnippet,
  deleteSnippet,
  createSnippet,
} = require("./controllers/snippets.controllers");

const verifyToken = require("./middlewares/verifyToken");

router.get("/", getSnippetList);

router.get("/:id", getSnippet);

router.post("/", shareSnippet);

router.delete("/", verifyToken, deleteSnippet);

router.post("/new", verifyToken, createSnippet);

module.exports = router;
