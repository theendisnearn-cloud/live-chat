// server.js
const express = require("express");
const path = require("path");
const http = require("http");
const { WebSocketServer } = require("ws");

const app = express();

// --------------------
// Serve static files
// --------------------
app.use(express.static(path.join(__dirname)));

// --------------------
// Create HTTP server
// --------------------
const server = http.createServer(app);

// --------------------
// WebSocket server
// --------------------
const wss = new WebSocketServer({ server });

let users = new Map();
let supports = new Set();

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message.toString());

    if (data.type === "support_join") {
      ws.isSupport = true;
      supports.add(ws);
      console.log("🧑‍💻 Support connected");
      return;
    }

    if (data.type === "join") {
      ws.sessionId = data.sessionId;
      users.set(ws.sessionId, ws);
      console.log("👤 User joined:", ws.sessionId);
      return;
    }

    if (data.type === "user_message") {
      supports.forEach((support) => {
        support.send(JSON.stringify({
          type: "user_message",
          sessionId: ws.sessionId,
          text: data.text,
          time: Date.now()
        }));
      });
    }

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

// --------------------
// Start server
// --------------------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
