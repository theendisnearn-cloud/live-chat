// ============================
// server.js (FINAL)
// ============================

const express = require("express");
const path = require("path");
const http = require("http");
const { WebSocketServer } = require("ws");
const multer = require("multer");

// ----------------------------
// App + Server
// ----------------------------
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// ----------------------------
// Serve static files
// (chat-widget.js, support.html)
// ----------------------------
app.use(express.static(path.join(__dirname)));

// ----------------------------
// Multer (file uploads – ready)
// ----------------------------
const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("file"), (req, res) => {
  res.json({
    success: true,
    file: req.file,
  });
});

// ----------------------------
// Support dashboard route
// ----------------------------
app.get("/support", (req, res) => {
  res.sendFile(path.join(__dirname, "support.html"));
});

// ----------------------------
// Start HTTP server
// ----------------------------
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// ----------------------------
// WebSocket server
// ----------------------------
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("🟢 WebSocket client connected");

  ws.on("message", (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch (err) {
      console.error("❌ Invalid JSON:", raw.toString());
      return;
    }

    // Ensure required fields
    if (!data.timestamp) {
      data.timestamp = new Date().toISOString();
    }

    // Broadcast to ALL connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(data));
      }
    });
  });

  ws.on("close", () => {
    console.log("🔴 WebSocket client disconnected");
  });
});
