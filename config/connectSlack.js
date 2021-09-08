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
  const channelList = {};

  app.command("/code", async ({ ack, body, client, logger }) => {
    const { channel_id } = body;

    await ack();

    try {
      const result = await client.views.open({
        trigger_id: body.trigger_id,
        view: {
          type: "modal",
          callback_id: "view_1",
          ...modalTemplate,
        }
      });

      const view_id = result.view.id;

      channelList[view_id] = channel_id;
    } catch (error) {
      logger.error(error);
    }
  });

  app.view("view_1", async ({ ack, body, view, client, logger }) => {
    await ack();

    const hashTag = view.state.values.hashTag.sl_input.value;
    const language = view.state.values.language["static_select-action"].selected_option.text.text;
    const spaces = view.state.values.spaces["static_select-action"].selected_option.text.text;
    const snippet = view.state.values.snippet.ml_input.value;

    const channel_id = channelList[view.id];

    try {
      await client.chat.postMessage({
        channel: channel_id,
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
