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

    const findAndDeleteHashtag = async (hashtag) => {
      const currentHashtag = await Hashtag.findOne({ name: hashtag });

      if (currentHashtag === null) {
        return;
      }

      const index = currentHashtag.snippetList.findIndex((snippet) => String(snippet) === String(snippetId));

      if (index === -1) {
        return;
      }

      await currentHashtag.save();
    };

    await Promise.all(hashtagList.map(async (hashtag) => await findAndDeleteHashtag(hashtag)));

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
