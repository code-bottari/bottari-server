const mongoose = require("mongoose");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");

const Snippet = require("../../models/Snippet");
const Hashtag = require("../../models/Hashtag");

const {
  INVALID_ID,
  INVALID_REQUEST,
  NO_AUTHORITY_TO_ACCESS,
  NOT_FOUND,
  UNEXPECTED_ERROR,
  OK,
} = require("../../constants/messages");

const getSnippetList = async (req, res, next) => {
  const { userId } = req.params;
  const { language, search } = req.query;

  const hashtagList = search?.split(" ");

  try {
    const targets = {};

    userId && (targets.poster = userId);
    language && (targets.language = language);
    hashtagList && (targets.hashtagList = { $all: hashtagList });

    const snippetList = await Snippet.find(targets).populate(["creator", "poster"]);

    res
      .status(200)
      .send({ result: OK, snippetList });
  } catch (error) {
    next(error);
  }
};

const getSnippet = async (req, res, next) => {
  const { id } = req.params;

  try {
    const snippet = await Snippet
      .findById(id)
      .populate(["creator", "poster", "commentList.creator"]);

    const isInvalid = snippet === null;

    if (isInvalid) {
      throw createError(404, INVALID_ID);
    }

    res.send({ result: OK, snippet });
  } catch (error) {
    if (error.status) {
      next(error);

      return;
    }

    if (error instanceof mongoose.Error.CastError) {
      next(createError(422, INVALID_REQUEST));

      return;
    }

    next({ message: UNEXPECTED_ERROR });
  }
};

const deleteSnippet = async (req, res, next) => {
  const { id: snippetId } = req.body;
  const { auth: token } = req.cookies;

  const { _id: userId } = jwt.decode(token);

  try {
    const snippet = await Snippet.findById(snippetId);

    if (snippet === null) {
      throw createError(404, NOT_FOUND);
    }

    const { poster } = snippet;

    if (poster !== userId) {
      throw createError(403, NO_AUTHORITY_TO_ACCESS);
    }

    const deleteSnippet = await Snippet.findByIdAndDelete(snippetId, { new: true });

    const { hashtagList } = deleteSnippet;
    const transformedHashtagList = Array.from(hashtagList, (hashtag) => ({ name: hashtag }));
    const targets = { $or: transformedHashtagList };

    const matchedHashtags = await Hashtag.find(targets);

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
};

const createSnippet = async (req, res, next) => {
  const { creator, poster, language, code, hashtagList } = req.body;
  const { auth: token } = req.cookies;

  const { _id: userId } = jwt.decode(token);

  try {
    const inValidUser = String(userId) !== String(poster);

    if (inValidUser) {
      throw createError(403, NO_AUTHORITY_TO_ACCESS);
    }

    const createdSnippet = await Snippet.create({
      creator,
      poster,
      language,
      code,
      hashtagList,
    });

    const transformedHashtagList = Array.from(hashtagList, (hashtag) => ({ name: hashtag }));
    const targets = { $or: transformedHashtagList };

    const matchedHashtags = await Hashtag.find(targets);

    matchedHashtags.forEach(async (hashtag) => {
      hashtag.snippetList.push(createdSnippet._id);
      await hashtag.save();
    });

    const matchedHashtagNames = matchedHashtags.map((hashtag) => hashtag.name);
    const unmatchedHashtags = transformedHashtagList.filter((hashtag) => !matchedHashtagNames.includes(hashtag.name));

    if (unmatchedHashtags.length) {
      const createHashtagList = Array.from(unmatchedHashtags, (hashtag) => {
        hashtag.snippetList = createdSnippet._id;

        return hashtag;
      });

      await Hashtag.insertMany(createHashtagList);
    }

    res.send({ result: OK, snippet: createdSnippet });
  } catch (error) {
    if (error.status) {
      next(error);

      return;
    }

    next({ message: UNEXPECTED_ERROR });
  }
};

module.exports = {
  getSnippetList,
  getSnippet,
  deleteSnippet,
  createSnippet,
};
