// public/chat-widget.js
(function() {
  const wsUrl = "wss://live-chat-4i3s.onrender.com"; // your WebSocket URL
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => console.log("WebSocket connected successfully");
  ws.onmessage = (event) => displayMessage(event.data);

  // Create chat button
  const chatButton = document.createElement("div");
  chatButton.id = "chat-button";
  chatButton.innerText = "💬";
  document.body.appendChild(chatButton);

  const chatBox = document.createElement("div");
  chatBox.id = "chat-box";
  chatBox.style.display = "none";
  document.body.appendChild(chatBox);

  chatButton.addEventListener("click", () => {
    chatBox.style.display = chatBox.style.display === "none" ? "block" : "none";
  });

  const input = document.createElement("input");
  input.id = "chat-input";
  input.placeholder = "Type a message...";
  chatBox.appendChild(input);

  const sendButton = document.createElement("button");
  sendButton.innerText = "Send";
  chatBox.appendChild(sendButton);

  sendButton.addEventListener("click", sendMessage);

  function sendMessage() {
    const message = input.value.trim();
    if (!message) return;
    const payload = {
      role: "customer",
      message,
      timestamp: new Date().toISOString()
    };
    ws.send(JSON.stringify(payload));
    displayMessage(JSON.stringify(payload));
    input.value = "";
  }

  function displayMessage(raw) {
    let data;
    try { data = JSON.parse(raw); } catch { return; }

    const msgDiv = document.createElement("div");
    msgDiv.className = data.role === "customer" ? "customer-msg" : "support-msg";
    msgDiv.innerText = `[${new Date(data.timestamp).toLocaleTimeString()}] ${data.role.toUpperCase()}: ${data.message}`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
})();
