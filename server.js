const express = require("express");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
app.use(cors());

const server = app.listen(process.env.PORT || 3000, () => {
  console.log("✅ Server running");
});

const wss = new WebSocket.Server({ server });

let users = new Map();     // sessionId → user socket
let supports = new Set(); // all support sockets

wss.on("connection", (ws) => {

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    // Support joins
    if (data.type === "support_join") {
      ws.isSupport = true;
      supports.add(ws);
      console.log("🧑‍💻 Support connected");
      return;
    }

    // User joins
    if (data.type === "join") {
      ws.sessionId = data.sessionId;
      users.set(ws.sessionId, ws);
      console.log("👤 User joined:", ws.sessionId);
      return;
    }

    // User sends message
    if (data.type === "user_message") {
      console.log(`👤 ${ws.sessionId}: ${data.text}`);

      supports.forEach(support => {
        support.send(JSON.stringify({
          type: "user_message",
          sessionId: ws.sessionId,
          text: data.text,
          time: Date.now()
        }));
      });
    }

    // Support sends message
    if (data.type === "support_message") {
      const user = users.get(data.sessionId);
      if (user) {
        user.send(JSON.stringify({
          type: "support_message",
          text: data.text,
          time: Date.now()
        }));
      }
    }
  });

  ws.on("close", () => {
    if (ws.isSupport) supports.delete(ws);
    if (ws.sessionId) users.delete(ws.sessionId);
  });
});