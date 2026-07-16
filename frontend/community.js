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
const communitySection = document.getElementById("communitySection");

let currentPosts = [];
let activePostId = null;

async function init() {
  try {
    loadingState.style.display = "none";
    communitySection.style.display = "block";
    fetch(`${API_BASE_URL}/api/community/mark-visited`, { method: "POST", headers });
    await loadPosts();
  } catch (err) {
    loadingState.innerHTML = '<p class="title">Could not reach the server.</p>';
  }
}
init();

document.getElementById("postSubmitBtn").addEventListener("click", async () => {
  const msgEl = document.getElementById("postMsg");
  const content = document.getElementById("postInput").value.trim();
  if (!content) {
    msgEl.style.display = "block";
    msgEl.textContent = "Write something first.";
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/community/posts`, {
      method: "POST",
      headers,
      body: JSON.stringify({ content }),
    });
    const data = await res.json();

    if (!res.ok) {
      msgEl.style.display = "block";
      msgEl.textContent = data.message;
      return;
    }

    document.getElementById("postInput").value = "";
    msgEl.style.display = "none";
    loadPosts();
  } catch (err) {
    msgEl.style.display = "block";
    msgEl.textContent = "Could not reach the server.";
  }
});

async function loadPosts() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/community/posts`, { headers });
    const data = await res.json();
    currentPosts = data.posts;

    const listEl = document.getElementById("postsList");
    listEl.innerHTML =
      currentPosts
        .map(
          (p) => `
        <div class="entry-card community-post-card">
          <div class="post-author-row">
            ${
              p.author.profilePicture
                ? `<img src="${p.author.profilePicture}" class="post-author-avatar">`
                : `<i class='bx bxs-user-circle post-author-avatar-placeholder'></i>`
            }
            <div>
              <p class="post-author-name">${escapeHtml(p.author.firstName)}</p>
              <p class="post-date">${formatDate(p.createdAt)}</p>
            </div>
          </div>
          <p class="entry-content post-content">${escapeHtml(p.content)}</p>
          <div class="post-actions">
            <button class="post-like-btn ${p.likedByMe ? "liked" : ""}" data-id="${p.id}">
              <i class='bx ${p.likedByMe ? "bxs-heart" : "bx-heart"}'></i> ${p.likesCount}
            </button>
            <button class="post-comment-btn" data-id="${p.id}">
              <i class='bx bx-comment'></i> ${p.commentsCount}
            </button>
          </div>
        </div>`
        )
        .join("") || '<p class="empty-msg">No posts yet — be the first to share something!</p>';

    document.querySelectorAll(".post-like-btn").forEach((btn) =>
      btn.addEventListener("click", () => toggleLike(btn.dataset.id, btn))
    );
    document.querySelectorAll(".post-comment-btn").forEach((btn) =>
      btn.addEventListener("click", () => openComments(btn.dataset.id))
    );
  } catch (err) {
    document.getElementById("postsList").innerHTML = '<p class="empty-msg">Could not load posts.</p>';
  }
}

async function toggleLike(postId, btn) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/community/posts/${postId}/like`, { method: "POST", headers });
    const data = await res.json();
    btn.innerHTML = `<i class='bx ${data.likedByMe ? "bxs-heart" : "bx-heart"}'></i> ${data.likesCount}`;
    btn.classList.toggle("liked", data.likedByMe);
  } catch (err) {
    alert("Could not reach the server.");
  }
}

function openComments(postId) {
  activePostId = postId;
  document.getElementById("commentsOverlay").classList.add("open");
  document.getElementById("commentsPanel").classList.add("open");
  loadComments(postId);
}

document.getElementById("commentsCloseBtn").addEventListener("click", closeComments);
document.getElementById("commentsOverlay").addEventListener("click", closeComments);
function closeComments() {
  document.getElementById("commentsOverlay").classList.remove("open");
  document.getElementById("commentsPanel").classList.remove("open");
}

async function loadComments(postId) {
  const listEl = document.getElementById("commentsList");
  listEl.innerHTML = '<p class="empty-msg">Loading...</p>';
  try {
    const res = await fetch(`${API_BASE_URL}/api/community/posts/${postId}/comments`, { headers });
    const data = await res.json();

    listEl.innerHTML =
      data.comments
        .map(
          (c) => `
        <div class="entry-card comment-card">
          <div class="post-author-row">
            ${
              c.author.profilePicture
                ? `<img src="${c.author.profilePicture}" class="post-author-avatar small">`
                : `<i class='bx bxs-user-circle post-author-avatar-placeholder small'></i>`
            }
            <div>
              <p class="post-author-name">${escapeHtml(c.author.firstName)}</p>
              <p class="entry-content">${escapeHtml(c.content)}</p>
            </div>
          </div>
        </div>`
        )
        .join("") || '<p class="empty-msg">No comments yet.</p>';
  } catch (err) {
    listEl.innerHTML = '<p class="empty-msg">Could not load comments.</p>';
  }
}

document.getElementById("commentSendBtn").addEventListener("click", async () => {
  const input = document.getElementById("commentInput");
  const content = input.value.trim();
  if (!content || !activePostId) return;

  try {
    await fetch(`${API_BASE_URL}/api/community/posts/${activePostId}/comments`, {
      method: "POST",
      headers,
      body: JSON.stringify({ content }),
    });
    input.value = "";
    loadComments(activePostId);
    loadPosts();
  } catch (err) {
    alert("Could not reach the server.");
  }
});

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}