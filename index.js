process.env.NODE_ENV =
  process.env.NODE_ENV &&
  process.env.NODE_ENV.trim().toLowerCase() == "production"
    ? "production"
    : "development";

const { Server } = require("https");
const path = require("path");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
// http server를 넘겨서 socket.io server 인스턴스를 생성한다.
const io = require("socket.io")(server, { path: "/socket" });
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === "production") {
  // frontend에서 빌드한 파일들을 사용한다.
  app.use(express.static(path.join(__dirname, "frontend/build")));

  // http://localhost:${PORT} 로 접속하면 클라이언트로 index.html을 전송한다.
  app.get("*", (req, res) => {
    res.sendFile(path.join(`${__dirname}/frontend/build/index.html`));
  });
}

// socket.io `connection` event handler
io.on("connection", (socket) => {
  console.log("user connected");

  // socket `disconnect` event handler
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  // socket `chat` event handler
  socket.on("chat", (message) => {
    console.log(`chat: ${message}`);
    io.emit("chat", message);
  });
});

server.listen(PORT, () => {
  console.log("Mission 5 : WebSocket");
  console.log(`Server is running and listening on port ${PORT}!`);
});
