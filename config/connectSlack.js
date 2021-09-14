/* eslint-disable no-console */
const { App } = require("@slack/bolt");

const modalTemplate = require("./modal.json");

const {
  SLACK_SIGNING_SECRET,
  SLACK_BOT_TOKEN,
  SLACK_APP_TOKEN,
  PORT,
} = require("./envConfig");

const app = new App({
  signingSecret: SLACK_SIGNING_SECRET,
  token: SLACK_BOT_TOKEN,
  appToken: SLACK_APP_TOKEN,
  socketMode: true,
});

(async () => {
  await app.start(PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();

(function () {
  const channelStorage = {};

  app.command("/code", async ({ ack, body, client, logger }) => {
    const {
      channel_id: channelId,
      trigger_id: triggerId,
    } = body;

    await ack();

    try {
      const result = await client.views.open({
        trigger_id: triggerId,
        view: {
          type: "modal",
          callback_id: "codeModal",
          ...modalTemplate,
        }
      });

      const { id: viewId } = result.view;

      channelStorage[viewId] = channelId;
    } catch (error) {
      logger.error(error);
    }
  });

  app.view("codeModal", async ({ ack, body, view, client, logger }) => {
    await ack();

    const hashTag = view.state.values.hashTag.input.value;
    const language = view.state.values.language.select.selected_option.text.text;
    const spaces = view.state.values.spaces.select.selected_option.text.text;
    const snippet = view.state.values.snippet.input.value;

    const { id: viewId } = view;

    const channelId = channelStorage[viewId];

    try {
      await client.chat.postMessage({
        channel: channelId,
        text: snippet,
      });
    } catch (error) {
      logger.error(error);
    }
  });

  app.error(async (error) => {
    console.log(error);
  });
})();
