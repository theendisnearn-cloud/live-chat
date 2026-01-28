// server.js
const express = require('express');
const path = require('path');
const { WebSocketServer } = require('wss'); // ✅ Updated for Node v22+

const app = express();

// --------------------------
// 1️⃣ Serve static files
// --------------------------
// This allows https://live-chat-4i3s.onrender.com/chat-widget.js to load
app.use(express.static(path.join(__dirname)));

// --------------------------
// 2️⃣ Start Express server
// --------------------------
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Express server running on port ${port}`));

// --------------------------
// 3️⃣ Start WebSocket server
// --------------------------
const wssPort = process.env.WS_PORT || 8080; // you can configure via Render env if needed
const wss = new WebSocketServer({ port: wssPort });

wss.on('connection', (socket) => {
  console.log('Client connected');

  // Send a welcome message immediately
  socket.send(JSON.stringify({ type: 'welcome', message: 'Hello from server!' }));

  // Handle incoming messages
  socket.on('message', (msg) => {
    console.log('Received:', msg.toString());

    // Example: echo message back to sender
    socket.send(JSON.stringify({ type: 'echo', message: msg.toString() }));
  });

  socket.on('close', () => {
    console.log('Client disconnected');
  });
});

// Optional: Broadcast to all clients
function broadcast(data) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });
}
