/* eslint-disable no-console */
const { App } = require("@slack/bolt");

const modalTemplate = require("./modal.json");

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
