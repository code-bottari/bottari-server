const express = require("express");
const router = express.Router();

const { getSnippetList, getSnippet, deleteSnippet } = require("./controllers/snippets.controllers");

const verifyToken = require("./middlewares/verifyToken");

router.get("/", getSnippetList);

router.get("/:id", getSnippet);

router.delete("/:id", verifyToken, deleteSnippet);

module.exports = router;
