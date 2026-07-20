const API_BASE_URL = "";

const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "structure.html";
}

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

async function loadConversations() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/chat/conversations`, { headers });
    const data = await res.json();

    const listEl = document.getElementById("conversationsList");
    listEl.innerHTML =
      data.conversations
        .map(
          (c) => `
        <div class="entry-card conversation-row" data-id="${c.userId}">
          ${
            c.profilePicture
              ? `<img src="${c.profilePicture}" class="post-author-avatar">`
              : `<i class='bx bxs-user-circle post-author-avatar-placeholder'></i>`
          }
          <div class="conversation-info">
            <p class="post-author-name">${escapeHtml(c.firstName)}</p>
            <p class="entry-date conversation-preview">${escapeHtml(c.lastMessage)}</p>
          </div>
        </div>`
        )
        .join("") || '<p class="empty-msg">No conversations yet — search for someone above to start one.</p>';

    document.querySelectorAll(".conversation-row").forEach((row) =>
      row.addEventListener("click", () => (window.location.href = `chat.html?to=${row.dataset.id}`))
    );
  } catch (err) {
    document.getElementById("conversationsList").innerHTML = '<p class="empty-msg">Could not load conversations.</p>';
  }
}
loadConversations();

let searchTimeout;
document.getElementById("searchInput").addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  const q = e.target.value.trim();
  const resultsEl = document.getElementById("searchResults");
  const convLabel = document.getElementById("conversationsLabel");
  const convList = document.getElementById("conversationsList");

  if (!q) {
    resultsEl.style.display = "none";
    convLabel.style.display = "block";
    convList.style.display = "flex";
    return;
  }

  searchTimeout = setTimeout(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/search?q=${encodeURIComponent(q)}`, { headers });
      const data = await res.json();

      convLabel.style.display = "none";
      convList.style.display = "none";
      resultsEl.style.display = "flex";
      resultsEl.innerHTML =
        data.users
          .map(
            (u) => `
          <div class="entry-card conversation-row" data-id="${u._id}">
            ${
              u.profilePicture
                ? `<img src="${u.profilePicture}" class="post-author-avatar">`
                : `<i class='bx bxs-user-circle post-author-avatar-placeholder'></i>`
            }
            <div class="conversation-info">
              <p class="post-author-name">${escapeHtml(u.firstName)} ${escapeHtml(u.lastName)}</p>
            </div>
          </div>`
          )
          .join("") || '<p class="empty-msg">No one found.</p>';

      document.querySelectorAll("#searchResults .conversation-row").forEach((row) =>
        row.addEventListener("click", () => (window.location.href = `chat.html?to=${row.dataset.id}`))
      );
    } catch (err) {
      resultsEl.innerHTML = '<p class="empty-msg">Could not search.</p>';
    }
  }, 300);
});

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}