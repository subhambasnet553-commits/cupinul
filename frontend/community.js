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
let composedImageData = null;

document.getElementById("postImageInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const MAX_DIM = 1000;
      let { width, height } = img;
      if (width > height && width > MAX_DIM) { height = Math.round((height * MAX_DIM) / width); width = MAX_DIM; }
      else if (height > MAX_DIM) { width = Math.round((width * MAX_DIM) / height); height = MAX_DIM; }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      composedImageData = canvas.toDataURL("image/jpeg", 0.8);
      document.getElementById("postImagePreview").src = composedImageData;
      document.getElementById("postImagePreviewWrap").style.display = "block";
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

document.getElementById("removePostImageBtn").addEventListener("click", () => {
  composedImageData = null;
  document.getElementById("postImageInput").value = "";
  document.getElementById("postImagePreviewWrap").style.display = "none";
});
async function init() {
  try {
    loadingState.style.display = "none";
    communitySection.style.display = "flex";
    fetch(`${API_BASE_URL}/api/community/mark-visited`, { method: "POST", headers });
    await loadPosts();
  } catch (err) {
    loadingState.innerHTML = '<p class="title">Could not reach the server.</p>';
  }
}
init();


document.getElementById("postForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById("postMsg");
  const content = document.getElementById("postInput").value.trim();
  if (!content && !composedImageData) {
    msgEl.style.display = "block";
    msgEl.textContent = "Write something or add a photo first.";
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/community/posts`, {
      method: "POST",
      headers,
      body: JSON.stringify({ content, imageData: composedImageData }),
    });
    const data = await res.json();

    if (!res.ok) {
      msgEl.style.display = "block";
      msgEl.textContent = data.message;
      return;
    }

    document.getElementById("postInput").value = "";
    composedImageData = null;
    document.getElementById("postImageInput").value = "";
    document.getElementById("postImagePreviewWrap").style.display = "none";
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
    currentPosts = data.posts.slice().reverse();
    const listEl = document.getElementById("postsList");
    listEl.innerHTML =
      currentPosts
        .map(
          (p) => `
        <div class="entry-card community-post-card">
         <div class="post-author-row clickable-author" data-userid="${p.author.id}">
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
         ${p.imageData ? `<img src="${p.imageData}" class="post-image">` : ""}
          ${p.content ? `<p class="entry-content post-content">${escapeHtml(p.content)}</p>` : ""}
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
    document.querySelectorAll(".clickable-author").forEach((el) =>
      el.addEventListener("click", () => openUserProfile(el.dataset.userid))
    );
   if (!window._communityScrolledOnce) {
      const listEl2 = document.getElementById("postsList");
      listEl2.scrollTop = listEl2.scrollHeight;
      window._communityScrolledOnce = true;
    }
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
async function openUserProfile(userId) {
  document.getElementById("userProfileOverlay").classList.add("open");
  document.getElementById("userProfilePanel").classList.add("open");

  try {
    const res = await fetch(`${API_BASE_URL}/api/users/${userId}/profile`, { headers });
    const data = await res.json();

    if (data.profilePicture) {
      document.getElementById("upAvatar").src = data.profilePicture;
      document.getElementById("upAvatar").style.display = "block";
      document.getElementById("upAvatarPlaceholder").style.display = "none";
    } else {
      document.getElementById("upAvatar").style.display = "none";
      document.getElementById("upAvatarPlaceholder").style.display = "flex";
    }

    document.getElementById("upName").textContent = `${data.firstName} ${data.lastName || ""}`.trim();
    document.getElementById("upHandle").textContent = `@${(data.firstName || "user").toLowerCase().replace(/\s+/g, "")}`;
    document.getElementById("upVerifiedBadge").style.display = data.isPremium ? "inline-block" : "none";
    document.getElementById("upNewBadge").style.display = data.isNew ? "inline-flex" : "none";

    if (data.partnerName) {
      document.getElementById("upPairedPill").style.display = "inline-flex";
      document.getElementById("upPartnerNamePill").textContent = data.partnerName;
    } else {
      document.getElementById("upPairedPill").style.display = "none";
    }

    const sinceDate = data.relationshipStartDate || data.pairedAt;
    document.getElementById("upSince").textContent = sinceDate
      ? new Date(sinceDate).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
      : "—";

    document.getElementById("upFollowers").textContent = data.followersCount;
    document.getElementById("upBio").textContent = data.bio || "No bio yet";

    const followBtn = document.getElementById("upFollowBtn");
    const messageBtn = document.getElementById("upMessageBtn");

    if (data.isMe) {
      followBtn.style.display = "none";
      messageBtn.style.display = "none";
    } else {
      followBtn.style.display = "block";
      messageBtn.style.display = "flex";
      followBtn.innerHTML = data.isFollowedByMe ? "Following" : "<i class='bx bx-plus'></i> Follow";
      followBtn.classList.toggle("up-following", data.isFollowedByMe);
      followBtn.onclick = () => toggleFollowUser(userId, followBtn);
      messageBtn.onclick = () => (window.location.href = `chat.html?to=${userId}`);
    }
  } catch (err) {
    document.getElementById("upName").textContent = "Could not load profile.";
  }
}

function closeUserProfile() {
  document.getElementById("userProfileOverlay").classList.remove("open");
  document.getElementById("userProfilePanel").classList.remove("open");
}

async function toggleFollowUser(userId, btn) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/${userId}/follow`, { method: "POST", headers });
    const data = await res.json();
    btn.innerHTML = data.following ? "Following" : "<i class='bx bx-plus'></i> Follow";
    btn.classList.toggle("up-following", data.following);
    document.getElementById("upFollowers").textContent = data.followersCount;
  } catch (err) {
    alert("Could not reach the server.");
  }
}

document.getElementById("userProfileCloseBtn").addEventListener("click", closeUserProfile);
document.getElementById("userProfileOverlay").addEventListener("click", closeUserProfile);