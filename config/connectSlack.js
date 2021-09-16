/* eslint-disable no-console */
const { App } = require("@slack/bolt");

const modalTemplate = require("./modal.json");

const {
  SLACK_SIGNING_SECRET,
  SLACK_BOT_TOKEN,
  SLACK_APP_TOKEN,
} = require("./envConfig");

const app = new App({
  signingSecret: SLACK_SIGNING_SECRET,
  token: SLACK_BOT_TOKEN,
  appToken: SLACK_APP_TOKEN,
  socketMode: true,
});

(async () => {
  await app.start();

  console.log("⚡️ Bolt app is running!");
})();

const changeType = (language) => {
  const filetypes = {
    Python: "python",
    Java: "java",
    JavaScript: "javascript",
    CSS: "css",
    C: "c",
    "C++": "cpp",
    "C#": "csharp",
    PHP: "php",
    R: "r",
    "Objective-C": "objc",
  };

  const filetype = filetypes[language];

  return filetype;
};

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

    const name = view.state.values.title.input.value;
    const message = view.state.values.message.input.value;
    const language = view.state.values.language.select.selected_option.text.text;
    const code = view.state.values.snippet.input.value;

    const { id: viewId } = view;

    const channelId = channelStorage[viewId];

    const filetype = changeType(language);
    try {
      const result = await client.files.upload({
        token: token,
        channels: channelId,
        initial_comment: message,
        filename: name,
        title: name,
        content: code,
        filetype,
      });

      delete channelStorage[viewId];

      console.log(result);
    }
    catch (error) {
      console.error(error);
    }
  });

  app.error(async (error) => {
    console.log(error);
  });
})();
