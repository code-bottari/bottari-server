const express = require("express");
const router = express.Router();

const verifyToken = require("./middlewares/verifyToken");

const {
  verifyUserData,
  registerUser,
  logout,
  getNotification,
  getFollowingUsers,
  getUserData,
  updateUserData,
} = require("./controllers/users.controllers");

router.post("/check-member", verifyUserData);

router.post("/register", registerUser);

router.get("/logout", logout);

router.get("/notification", verifyToken, getNotification);

router.get("/following/:id", getFollowingUsers);

router.get("/:id", getUserData);

router.patch("/:id", verifyToken, updateUserData);

module.exports = router;
