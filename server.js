const express = require('express');
const path = require('path');
const app = express();

// Serve all files in the project folder as static files
app.use(express.static(path.join(__dirname)));
const server = app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});

const wss = new WebSocket.Server({ server });

let users = new Map(); // sessionId → socket
let supportSocket = null;

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message);

    // Support dashboard joins
    if (data.type === "support_join") {
      supportSocket = ws;
      console.log("🧑‍💻 Support connected");
      return;
    }

    // User joins
    if (data.type === "join") {
      ws.sessionId = data.sessionId;
      users.set(data.sessionId, ws);
      console.log("User joined:", data.sessionId);
      return;
    }

    // User sends message
    if (data.type === "user_message") {
      console.log(`User (${ws.sessionId}):`, data.text);

      // Forward to support
      if (supportSocket) {
        supportSocket.send(JSON.stringify({
          type: "user_message",
          sessionId: ws.sessionId,
          text: data.text
        }));
      }
    }

    // Support sends message
    if (data.type === "support_message") {
      const user = users.get(data.sessionId);
      if (user) {
        user.send(JSON.stringify({
          type: "support_message",
          text: data.text
        }));
      }
    }
  });

  ws.on("close", () => {
    if (ws === supportSocket) supportSocket = null;
    if (ws.sessionId) users.delete(ws.sessionId);
  });
});



