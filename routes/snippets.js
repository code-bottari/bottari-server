const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const createError = require("http-errors");

const Snippet = require("../models/Snippet");

const MESSAGES = require("../constants/messages");

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;

  const {
    OK,
    INVALID_ID,
    INVALID_REQUEST,
    INTERNAL_SERVER_ERROR,
  } = MESSAGES;

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

module.exports = router;
