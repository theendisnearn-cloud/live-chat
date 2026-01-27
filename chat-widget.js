(function () {
  const sessionId =
    localStorage.getItem("chat_session") ||
    Math.random().toString(36).substring(2);

  localStorage.setItem("chat_session", sessionId);

  const socket = new WebSocket("ws://YOUR_DOMAIN_HERE");

  // ---- STYLES ----
  const style = document.createElement("style");
  style.innerHTML = `
    #chat-launcher {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #2563eb;
      color: white;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 24px;
      box-shadow: 0 10px 25px rgba(0,0,0,.2);
      z-index: 9999;
    }

    #chat-box {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 320px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,.2);
      font-family: Inter, Arial, sans-serif;
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 9999;
    }

    #chat-header {
      background: #2563eb;
      color: white;
      padding: 14px;
      font-weight: bold;
    }

    #chat-messages {
      flex: 1;
      padding: 12px;
      overflow-y: auto;
      background: #f9fafb;
    }

    .msg-user {
      text-align: right;
      margin-bottom: 8px;
    }

    .msg-user span {
      background: #2563eb;
      color: white;
      padding: 8px 12px;
      border-radius: 12px;
      display: inline-block;
      max-width: 80%;
    }

    .msg-support {
      text-align: left;
      margin-bottom: 8px;
    }

    .msg-support span {
      background: #e5e7eb;
      padding: 8px 12px;
      border-radius: 12px;
      display: inline-block;
      max-width: 80%;
    }

    #chat-input {
      border: none;
      padding: 12px;
      outline: none;
      border-top: 1px solid #ddd;
    }
  `;
  document.head.appendChild(style);

  // ---- HTML ----
  const launcher = document.createElement("div");
  launcher.id = "chat-launcher";
  launcher.innerHTML = "💬";

  const box = document.createElement("div");
  box.id = "chat-box";
  box.innerHTML = `
    <div id="chat-header">Support</div>
    <div id="chat-messages"></div>
    <input id="chat-input" placeholder="Type your message..." />
  `;

  document.body.appendChild(launcher);
  document.body.appendChild(box);

  const messages = box.querySelector("#chat-messages");
  const input = box.querySelector("#chat-input");

  launcher.onclick = () => {
    box.style.display = box.style.display === "flex" ? "none" : "flex";
  };

  socket.onopen = () => {
    socket.send(JSON.stringify({
      type: "join",
      sessionId
    }));
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "support_message") {
      messages.innerHTML +=
        `<div class="msg-support"><span>${data.text}</span></div>`;
      messages.scrollTop = messages.scrollHeight;
    }
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && input.value.trim()) {
      const text = input.value;

      socket.send(JSON.stringify({
        type: "user_message",
        sessionId,
        text
      }));

      messages.innerHTML +=
        `<div class="msg-user"><span>${text}</span></div>`;
      messages.scrollTop = messages.scrollHeight;
      input.value = "";
    }
  });
})();
