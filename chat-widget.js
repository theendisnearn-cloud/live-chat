(function () {

  function getTime(ts = Date.now()) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const sessionId =
    localStorage.getItem("chat_session") ||
    Math.random().toString(36).substring(2);

  localStorage.setItem("chat_session", sessionId);

  const socket = new WebSocket("wss://live-chat-4i3s.onrender.com");

  // ---------- STYLES ----------
  const style = document.createElement("style");
  style.innerHTML = `
    #chat-launcher {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg,#2563eb,#1e40af);
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 12px 30px rgba(0,0,0,.25);
      z-index: 9999;
    }

    #chat-box {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 320px;
      height: 420px;
      background: white;
      border-radius: 14px;
      box-shadow: 0 20px 40px rgba(0,0,0,.25);
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: Inter, Arial, sans-serif;
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
      background: #f9fafb;
      overflow-y: auto;
    }

    .msg-user { text-align: right; margin-bottom: 10px; }
    .msg-support { text-align: left; margin-bottom: 10px; }

    .bubble {
      display: inline-block;
      padding: 8px 12px;
      border-radius: 12px;
      max-width: 80%;
      font-size: 14px;
    }

    .user { background: #2563eb; color: white; }
    .support { background: #e5e7eb; color: black; }

    .meta {
      font-size: 11px;
      color: #6b7280;
      margin-top: 2px;
    }

    #chat-input {
      border: none;
      border-top: 1px solid #ddd;
      padding: 12px;
      outline: none;
    }
  `;
  document.head.appendChild(style);

  // ---------- HTML ----------
  const launcher = document.createElement("div");
  launcher.id = "chat-launcher";
  launcher.innerHTML = `
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"
        stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

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
      messages.innerHTML += `
        <div class="msg-support">
          <div class="bubble support"><b>Support</b><br>${data.text}</div>
          <div class="meta">${getTime(data.time)}</div>
        </div>
      `;
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

      messages.innerHTML += `
        <div class="msg-user">
          <div class="bubble user"><b>Customer</b><br>${text}</div>
          <div class="meta">${getTime()}</div>
        </div>
      `;

      messages.scrollTop = messages.scrollHeight;
      input.value = "";
    }
  });

})();
