const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");

const Snippet = require("../models/Snippet");
const Hashtag = require("../models/Hashtag");

const {
  OK,
  INVALID_ID,
  INVALID_REQUEST,
  NO_AUTHORITY_TO_ACCESS,
  NOT_FOUND,
  UNEXPECTED_ERROR,
} = require("../constants/messages");

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

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    const snippet = await Snippet.findById(id);

    if (snippet === null) {
      throw createError(404, INVALID_ID);
    }

    res.send({ result: OK, ...snippet.toObject() });
  } catch (error) {
    if (error.status) {
      next(error);
      return;
    }

    if (error instanceof mongoose.Error.CastError) {
      next(createError(422, INVALID_REQUEST));
      return;
    }

    next({ message: INTERNAL_SERVER_ERROR });
  }
});

router.delete("/:id", async (req, res, next) => {
  const { id: snippetId } = req.params;
  const { auth: token } = req.cookies;

  const { _id: userId } = jwt.decode(token);

  try {
    const snippet = await Snippet.findById(snippetId);

    if (snippet === null) {
      throw createError(404, NOT_FOUND);
    }

    const { poster, hashtagList } = snippet;

    if (poster !== userId) {
      throw createError(403, NO_AUTHORITY_TO_ACCESS);
    }

    await Snippet.findByIdAndDelete(snippetId);

    const matchedHashtags = await Hashtag.find({ $or: [{ name: "#some" }, { name: "#every" }, { name: "map" }, { name: "#reduce" },] });

    const deleteSnippetId = async (hashtag) => {
      const { snippetList } = hashtag;

      const index = snippetList.findIndex((targetId) => String(targetId) === String(snippetId));

      const hasHashtag = index !== -1;

      if (!hasHashtag) {
        return;
      }

      snippetList.splice(index, 1);

      await hashtag.save();
    };

    const promises = matchedHashtags.map(async (hashtag) => await deleteSnippetId(hashtag));

    await Promise.all(promises);

    res.send({ result: OK });
  } catch (error) {
    if (error.status) {
      next(error);

      return;
    }

    next({ message: UNEXPECTED_ERROR });
  }
});

module.exports = router;
