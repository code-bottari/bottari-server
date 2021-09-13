const express = require("express");
const router = express.Router();

const verifyToken = require("./middlewares/verifyToken");

const {
  verifyUserData,
  registerUser,
  getNotification,
  getFollowingUsers,
  getUserData,
  updateUserData,
} = require("./controllers/users.controllers");

router.get("/check-member/:idToken", verifyUserData);

router.post("/register", registerUser);

router.get("/notification", verifyToken, getNotification);

router.get("/following/:id", getFollowingUsers);

router.get("/:id", getUserData);

router.patch("/:id", verifyToken, updateUserData);

module.exports = router;
