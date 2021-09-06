const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const comment = mongoose.Schema({
  creator: {
    type: ObjectId,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
});

const snippetSchema = mongoose.Schema({
  creator: {
    type: ObjectId,
    required: true,
  },
  poster: {
    type: ObjectId,
    required: true,
  },
  commentList: [comment],
  createdAt: {
    type: Date,
    required: true,
  },
  language: {
    type: String,
    required: true,
    enum: [],
  },
  code: {
    type: String,
    required: true,
  },
  likerList: {
    type: Array,
    required: true,
  },
  hashtahList: {
    type: Array,
    required: true,
  },
});

module.exports = mongoose.model("Snippet", snippetSchema);
