const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", console.log.bind(console, "Connected to database.."));
