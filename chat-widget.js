(function () {

  function time(ts = Date.now()) {
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  const sessionId =
    localStorage.getItem("chat_session") ||
    Math.random().toString(36).slice(2);

  localStorage.setItem("chat_session", sessionId);

  const socket = new WebSocket("wss://live-chat-4i3s.onrender.com");

  /* ---------- STYLES ---------- */
  const style = document.createElement("style");
  style.textContent = `
    #lc-btn {
      position: fixed; bottom: 20px; right: 20px;
      width: 56px; height: 56px;
      border-radius: 50%;
      background: #2563eb; color: white;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; box-shadow: 0 10px 30px rgba(0,0,0,.3);
      z-index: 99999;
    }

    #lc-box {
      position: fixed; bottom: 90px; right: 20px;
      width: 340px; height: 440px;
      background: white; border-radius: 14px;
      box-shadow: 0 20px 40px rgba(0,0,0,.3);
      display: none; flex-direction: column;
      font-family: Arial, sans-serif;
      overflow: hidden; z-index: 99999;
    }

    #lc-header {
      background: #2563eb; color: white;
      padding: 14px; font-weight: bold;
    }

    #lc-msgs {
      flex: 1; padding: 12px;
      background: #f9fafb; overflow-y: auto;
    }

    .msg { margin-bottom: 12px; }
    .cust { text-align: right; }
    .sup { text-align: left; }

    .bubble {
      display: inline-block;
      padding: 8px 12px;
      border-radius: 12px;
      max-width: 80%;
      font-size: 14px;
    }

    .cust .bubble { background:#2563eb; color:white; }
    .sup .bubble { background:#e5e7eb; }

    .meta {
      font-size: 11px;
      color: #6b7280;
      margin-top: 2px;
    }

    #lc-input {
      border-top: 1px solid #ddd;
      display: flex; gap: 6px;
      padding: 8px;
    }

    #lc-input input[type="text"] {
      flex: 1; padding: 8px;
      border: 1px solid #ddd;
      border-radius: 6px;
    }
  `;
  document.head.appendChild(style);

  /* ---------- HTML ---------- */
  const btn = document.createElement("div");
  btn.id = "lc-btn";
  btn.textContent = "💬";

  const box = document.createElement("div");
  box.id = "lc-box";
  box.innerHTML = `
    <div id="lc-header">Live Support</div>
    <div id="lc-msgs"></div>
    <div id="lc-input">
      <input id="lc-text" type="text" placeholder="Type message…" />
      <input id="lc-file" type="file" />
    </div>
  `;

  document.body.append(btn, box);

  btn.onclick = () => {
    box.style.display = box.style.display === "flex" ? "none" : "flex";
  };

  const msgs = box.querySelector("#lc-msgs");
  const text = box.querySelector("#lc-text");
  const file = box.querySelector("#lc-file");

  socket.onopen = () => {
    socket.send(JSON.stringify({ type: "join", sessionId }));
  };

  socket.onmessage = (e) => {
    const d = JSON.parse(e.data);
    if (d.type === "support_message") {
      msgs.innerHTML += `
        <div class="msg sup">
          <div class="bubble">
            <b>Support</b><br>${d.text}
          </div>
          <div class="meta">${time(d.time)}</div>
        </div>
      `;
      msgs.scrollTop = msgs.scrollHeight;
    }
  };

  text.addEventListener("keydown", e => {
    if (e.key === "Enter" && text.value.trim()) {
      socket.send(JSON.stringify({
        type: "user_message",
        sessionId,
        text: text.value
      }));

      msgs.innerHTML += `
        <div class="msg cust">
          <div class="bubble">
            <b>You</b><br>${text.value}
          </div>
          <div class="meta">${time()}</div>
        </div>
      `;
      text.value = "";
      msgs.scrollTop = msgs.scrollHeight;
    }
  });

})();
