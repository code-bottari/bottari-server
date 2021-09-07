/* eslint-disable no-console */
const { App } = require("@slack/bolt");

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

(async () => {
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
