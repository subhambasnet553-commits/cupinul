const API_BASE_URL = "";

const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "structure.html";
}

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

const loadingState = document.getElementById("loadingState");
const chatSection = document.getElementById("chatSection");
const messagesList = document.getElementById("messagesList");

let myId = null;

async function init() {
  try {
    const pairRes = await fetch(`${API_BASE_URL}/api/pair/my-code`, { headers });
    const pairData = await pairRes.json();

    if (pairRes.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "structure.html";
      return;
    }
    if (!pairData.paired) {
      window.location.href = "home.html";
      return;
    }

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
  const res = await fetch(`${API_BASE_URL}/api/chat/history`, { headers });
  const data = await res.json();
  myId = data.myId;

  messagesList.innerHTML = "";
  data.messages.forEach(renderMessage);
  scrollToBottom();
}

function connectSocket() {
  const socket = io({ auth: { token } });

 socket.on("receive_message", (msg) => {
    const nearBottom = isNearBottom();
    renderMessage(msg);
    if (nearBottom) scrollToBottom();
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

function renderMessage(msg) {
  const isMine = msg.sender === myId;
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${isMine ? "mine" : "theirs"}`;
  bubble.innerHTML = `
    <p class="chat-bubble-text">${escapeHtml(msg.content)}</p>
    <p class="chat-bubble-time">${formatTime(msg.createdAt)}</p>
  `;
  messagesList.appendChild(bubble);
}

function scrollToBottom() {
  messagesList.scrollTop = messagesList.scrollHeight;
}
function isNearBottom() {
  const el = messagesList;
  return el.scrollHeight - el.scrollTop - el.clientHeight < 150;
}
function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
