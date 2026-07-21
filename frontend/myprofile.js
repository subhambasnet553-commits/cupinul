const API_BASE_URL = "";

const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "structure.html";
}

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

async function init() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/profile/full`, {
      headers,
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "structure.html";
      return;
    }

    const data = await res.json();

    document.getElementById("loadingState").style.display = "none";
    document.getElementById("myProfileSection").style.display = "block";

    if (data.profilePicture) {
      document.getElementById("mpAvatar").src = data.profilePicture;
      document.getElementById("mpAvatar").style.display = "block";
      document.getElementById("mpAvatarPlaceholder").style.display = "none";
    }

    document.getElementById("mpName").textContent =
      `${data.firstName} ${data.lastName || ""}`.trim();

    document.getElementById("mpFollowers").textContent =
      data.followersCount || 0;

    document.getElementById("mpFollowing").textContent =
      data.followingCount || 0;

    document.getElementById("mpPosts").textContent =
      data.postsCount || 0;

    document.getElementById("mpBio").innerHTML =
      data.bio
        ? escapeHtml(data.bio)
        : "<i>No bio yet — tap Edit Profile to add one!</i>";

    document.getElementById("mpJoined").textContent =
      new Date(data.joinedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

    document.getElementById("mpAchDays").textContent =
      data.daysTogether || 0;

    document.getElementById("mpAchPhotos").textContent =
      data.totalPhotos || 0;

    document.getElementById("mpAchEntries").textContent =
      data.totalEntries || 0;

    if (data.partner) {
      document.getElementById("mpPairedCard").style.display = "flex";

      document.getElementById("mpPartnerName").textContent =
        data.partner.firstName;

      document.getElementById("mpDaysTogether").textContent =
        `${data.daysTogether} days together`;

      if (data.partner.profilePicture) {
        document.getElementById("mpPartnerAvatar").src =
          data.partner.profilePicture;

        document.getElementById("mpPartnerAvatar").style.display = "block";
        document.getElementById("mpPartnerAvatarPlaceholder").style.display =
          "none";
      }
    }
  } catch (err) {
    console.error(err);
    document.getElementById("loadingState").innerHTML =
      '<p class="title">Could not reach the server.</p>';
  }
}

init();

document.getElementById("mpEditBtn").addEventListener("click", () => {
  if (typeof openProfilePanel === "function") {
    openProfilePanel();
  }
});

document.getElementById("mpSettingsBtn").addEventListener("click", () => {
  if (typeof openProfilePanel === "function") {
    openProfilePanel();

    setTimeout(() => {
      document
        .querySelector('.profile-tab[data-tab="security"]')
        ?.click();
    }, 100);
  }
});

document.getElementById("mpShareBtn").addEventListener("click", async () => {
  const text = `Check out my Cupinul profile! ${window.location.origin}`;

  try {
    await navigator.clipboard.writeText(text);
    alert("Link copied to clipboard!");
  } catch {
    alert(text);
  }
});

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}