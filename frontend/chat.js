const API_BASE_URL = "";

const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "structure.html";
}

const params = new URLSearchParams(window.location.search);
const targetUserId = params.get("to");
if (!targetUserId) {
  window.location.href = "messages.html";
}

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

const loadingState = document.getElementById("loadingState");
const chatSection = document.getElementById("chatSection");
const messagesList = document.getElementById("messagesList");

let myId = null;
let socket = null;
let initialized = false; // guards against ever running init/connect twice

async function init() {
  if (initialized) return;
  initialized = true;

  try {
    loadingState.style.display = "none";
    chatSection.style.display = "flex";

    await loadHistory();
    connectSocket();
  } catch (err) {
    loadingState.innerHTML = '<p class="title">Could not reach the server.</p>';
  }
}
init();

async function loadHistory() {
  const res = await fetch(`${API_BASE_URL}/api/chat/history/${targetUserId}`, { headers });
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "structure.html";
    return;
  }
  const data = await res.json();
  myId = data.myId;

  if (data.otherUser) {
    document.getElementById("chatPartnerName").textContent = data.otherUser.firstName;
    if (data.otherUser.profilePicture) {
      document.getElementById("chatPartnerAvatar").src = data.otherUser.profilePicture;
      document.getElementById("chatPartnerAvatar").style.display = "block";
      document.getElementById("chatPartnerAvatarPlaceholder").style.display = "none";
    }
  }

  messagesList.innerHTML = "";
  let lastDateLabel = "";
  data.messages.forEach((msg) => {
    const label = dateLabel(msg.createdAt);
    if (label !== lastDateLabel) {
      renderDateDivider(label);
      lastDateLabel = label;
    }
    renderMessage(msg);
  });
  scrollToBottom();
}

function connectSocket() {
  if (socket) return; // never open a second connection
  socket = io({ auth: { token } });

  socket.emit("join_conversation", { userId: targetUserId });

  socket.on("presence_status", (data) => {
    if (data.userId === targetUserId) setPresence(data.online);
  });
  socket.on("presence_update", (data) => {
    if (data.userId === targetUserId) setPresence(data.online);
  });

  socket.on("receive_message", (msg) => {
    const nearBottom = isNearBottom();
    const label = dateLabel(msg.createdAt);
    if (!messagesList.dataset.lastLabel || messagesList.dataset.lastLabel !== label) {
      renderDateDivider(label);
    }
    renderMessage(msg);
    if (nearBottom) scrollToBottom();

    if (msg.sender !== myId) {
      socket.emit("message_seen");
    }
  });

  socket.on("messages_seen", (data) => {
    if (data.by !== myId) {
      document.querySelectorAll(".chat-bubble.mine .chat-bubble-check").forEach((el) => {
        el.classList.add("chat-bubble-seen");
      });
    }
  });

  document.getElementById("messageForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("messageInput");
    const content = input.value.trim();
    if (!content) return;

    socket.emit("send_message", { content });
    input.value = "";
  });
}

function setPresence(online) {
  const dot = document.getElementById("chatOnlineDot");
  const statusText = document.getElementById("chatStatusText");
  dot.style.display = online ? "block" : "none";
  statusText.textContent = online ? "Active now" : "";
}

function renderDateDivider(label) {
  messagesList.dataset.lastLabel = label;
  const divider = document.createElement("div");
  divider.className = "chat-date-divider";
  divider.innerHTML = `<span>${label}</span>`;
  messagesList.appendChild(divider);
}

function renderMessage(msg) {
  const isMine = msg.sender === myId;
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${isMine ? "mine" : "theirs"}`;
  bubble.innerHTML = `
    <p class="chat-bubble-text">${escapeHtml(msg.content)}</p>
    <p class="chat-bubble-time">${formatTime(msg.createdAt)}${isMine ? ' <i class="bx bx-check-double chat-bubble-check"></i>' : ""}</p>
  `;
  messagesList.appendChild(bubble);
}

function scrollToBottom() {
  messagesList.scrollTop = messagesList.scrollHeight;
}

function isNearBottom() {
  return messagesList.scrollHeight - messagesList.scrollTop - messagesList.clientHeight < 150;
}

function dateLabel(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric" });
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}