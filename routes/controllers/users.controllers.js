const createError = require("http-errors");
const jwt = require("jsonwebtoken");

const User = require("../../models/User");

const { decode } = require("../../services/usersService");

const { SECRET_KEY } = require("../../config/envConfig");

const {
  UNEXPECTED_ERROR,
  INVALID_REQUEST,
  INVALID_TOKEN,
  NOT_FOUND,
  OK,
  NO_AUTHORITY_TO_ACCESS,
} = require("../../constants/messages");

const verifyUserData = async (req, res, next) => {
  const { authorization } = req.headers;
  const idToken = authorization.split(" ")[1];

  try {
    const email = await decode(idToken);

    const user = await User.findOne({ email });

    const hasUserData = user !== null;

    if (hasUserData) {
      const token = jwt.sign(String(user._id), SECRET_KEY);

      res.cookie("auth", token, {
        maxAge: 1000 * 60 * 60, // hour = milliseconds * seconds * minutes
        httpOnly: true,
      });
    }

    res
      .status(200)
      .send({ result: OK, hasUserData });
  } catch (error) {
    if (error.status) {
      next(error);
    }

    next({ message: UNEXPECTED_ERROR });
  }
};

const registerUser = async (req, res, next) => {
  const { idToken, nickname, imageUrl } = req.body;

  try {
    const isValid = (idToken === undefined)
      || (nickname === undefined)
      || (imageUrl === undefined);

    if (!isValid) {
      throw createError(422, INVALID_REQUEST);
    }

    const email = decode(idToken);

    const user = await User.create({
      email,
      nickname,
      imageUrl,
    });

    const token = jwt.sign(user._id, SECRET_KEY);

    res
      .cookie("auth", token, {
        maxAge: 1000 * 60 * 60, // hour = milliseconds * seconds * minutes
        httpOnly: true,
      })
      .status(200)
      .send({ result: OK });
  } catch (error) {
    if (error.status) {
      next(error);
    }

    next({ message: UNEXPECTED_ERROR });
  }
};

const getNotification = async (req, res, next) => {
  const token = req.cookies.auth;

  try {
    if (token === undefined) {
      throw createError(401, INVALID_TOKEN);
    }

    const userId = jwt.decode(token);

    const user = await User.findById(userId);

    const hasUserData = user !== null;

    if (!hasUserData) {
      throw createError(404, NOT_FOUND);
    }

    const { notifications } = user;

    res
      .status(200)
      .send({ result: OK, notifications });
  } catch (error) {
    next(error);
  }
};

const getFollowingUsers = async (req, res, next) => {
  const { id } = req.params;

  try {
    const followerList = await User.find({ followerList: { $all: [id] } });

    res
      .status(200)
      .send({ result: OK, followerList });
  } catch (error) {
    next(error);
  }
};

const getUserData = async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    res
      .status(200)
      .send({ result: OK, user });
  } catch (error) {
    if (error.status) {
      next(error);

      return;
    }

    next({ message: UNEXPECTED_ERROR });
  }
};

const updateUserData = async (req, res, next) => {
  const { id: targetId } = req.params;
  const { nickname, imageUrl } = req.body;
  const { auth: token } = req.cookies;

  const userId = jwt.decode(token);

  try {
    if (targetId !== userId) {
      throw createError(403, NO_AUTHORITY_TO_ACCESS);
    }

    const isInvalid = nickname === undefined && imageUrl === undefined;

    if (isInvalid) {
      throw createError(422, INVALID_REQUEST);
    }

    const targets = {};

    nickname && (targets.nickname = nickname);
    imageUrl && (targets.imageUrl = imageUrl);

    const updatedUserData = await User.findByIdAndUpdate(userId, targets, { new: true });

    res
      .status(200)
      .send({ result: OK, updatedUserData });
  } catch (error) {
    if (error.status) {
      next(error);

      return;
    }

    next({ message: UNEXPECTED_ERROR });
  }
};

module.exports = {
  verifyUserData,
  registerUser,
  getNotification,
  getFollowingUsers,
  getUserData,
  updateUserData,
};
