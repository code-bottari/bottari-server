const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const notification = mongoose.Schema({
  type: {
    type: Array,
    required: true,
  },
  targetId: {
    type: ObjectId,
    required: true,
    ref: "User",
  },
  isChecked: {
    type: Boolean,
    required: true,
  },
});

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: false,
  },
  notificationList: [notification],
  subscriberList: {
    type: Array,
    default: [],
  },
  theme: {
    type: String,
    default: "default",
    enum: [],
  },
});

module.exports = mongoose.model("User", userSchema);
