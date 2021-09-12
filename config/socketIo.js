/* eslint-disable no-console */
const connectSocketIo = (app) => {
  app.io.on("connection", function (socket) {
    console.log("connected");

    socket.on("disconnect", function () {
      console.log("disconnected");
    });
  });
};

module.exports = connectSocketIo;
