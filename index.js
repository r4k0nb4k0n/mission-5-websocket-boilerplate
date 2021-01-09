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

let users = [];

// socket.io `connection` event handler
io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("set user", (payload) => {
    if (!users.includes(payload.username)) {
      users = [...users, payload.username];
      socket.broadcast.emit("dududunga", payload);
    } else {
      users = users.map((_username) =>
        _username === payload.username ? payload.nextUsername : _username
      );
      socket.broadcast.emit("change username", payload);
    }
  });

  // socket `disconnect` event handler
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("typing yet", (payload) => {
    console.log(`${payload.username} is typing yet`);
    socket.broadcast.emit("typing yet", payload);
  });

  socket.on("typing done", (payload) => {
    console.log(`${payload.username} is typing done`);
    socket.broadcast.emit("typing done", payload);
  });

  // socket `chat` event handler
  socket.on("chat", (payload) => {
    console.log(`${payload.username} sent: ${payload.message}`);
    socket.broadcast.emit("chat", payload);
  });
});

server.listen(PORT, () => {
  console.log("Mission 5 : WebSocket");
  console.log(`Server is running and listening on port ${PORT}!`);
});
