const SlackToken = require("../../models/SlackToken");

const { app } = require("../../config/connectSlack");

const {
  SLACK_BOT_CLIENT_ID,
  SLACK_BOT_CLIENT_SECRET,
} = require("../../config/envConfig");

const authorizeSlackApp = async (req, res, next) => {
  const { code } = req.query;

  const response = await app.client.oauth.v2.access({
    client_id: SLACK_BOT_CLIENT_ID,
    client_secret: SLACK_BOT_CLIENT_SECRET,
    code,
  });

  const { team, access_token: accessToken } = response;
  const { id: teamId } = team;

  await SlackToken.create({ teamId, accessToken });

  res.send(response);
};

module.exports = authorizeSlackApp;
