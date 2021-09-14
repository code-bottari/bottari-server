require("dotenv").config();

module.exports = {
  CLIENT_URL: process.env.CLIENT_URL,
  PORT: process.env.PORT,
  MONGO_URL: process.env.MONGO_URL,
  SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET,
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
  SLACK_APP_TOKEN: process.env.SLACK_APP_TOKEN,
  SECRET_KEY: process.env.SECRET_KEY,
};
