// Injects the full slide-out profile panel into whatever page includes this
// script. Requires a #profileBtn element to already exist on the page.

const PROFILE_API = "";
const profileToken = localStorage.getItem("token");
const profileHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${profileToken}`,
};

function buildProfilePanelHTML() {
  return `
    <div id="profileOverlay" class="profile-overlay"></div>
    <div id="profilePanel" class="profile-panel">
      <button id="profileCloseBtn" class="profile-close-btn"><i class='bx bx-x'></i></button>

      <div class="profile-tabs">
        <button class="profile-tab active" data-tab="edit"><i class='bx bx-user'></i></button>
        <button class="profile-tab" data-tab="summary"><i class='bx bx-heart'></i></button>
        <button class="profile-tab" data-tab="stats"><i class='bx bx-bar-chart-alt-2'></i></button>
        <button class="profile-tab" data-tab="prefs"><i class='bx bx-sliders'></i></button>
        <button class="profile-tab" data-tab="security"><i class='bx bx-lock-alt'></i></button>
        <button class="profile-tab" data-tab="inbox"><i class='bx bx-envelope'></i></button>
      </div>

      
    <!-- Edit Profile -->
      <div class="profile-tab-content" id="tab-edit">
        <div class="avatar-wrap">
          <img id="avatarPreview" class="avatar-preview" src="" style="display:none;" />
          <div id="avatarPlaceholder" class="avatar-placeholder"><i class='bx bxs-user-circle'></i></div>
          <label for="avatarInput" class="avatar-upload-btn"><i class='bx bx-camera'></i></label>
          <input type="file" id="avatarInput" accept="image/*" style="display:none;">
        </div>
        <button type="button" id="removePictureBtn" class="skip-link" style="display:none;">Remove picture</button>

        <label class="profile-label">First Name</label>
        <input type="text" id="firstNameInput" class="pair-input security-input">
       <label class="profile-label">Last Name</label>
        <input type="text" id="lastNameInput" class="pair-input security-input">
       

        <label class="profile-label">Bio</label>
        <textarea id="bioInput" class="bio-textarea" maxlength="280" placeholder="Tell your partner a little about you..."></textarea>
        <p class="bio-count"><span id="bioCount">0</span>/280</p>

        <button id="saveProfileBtn" class="huge-btn primary panel-submit-btn">Save Changes</button>
        <p id="profileMsg" class="write-msg" style="display:none;"></p>
      </div>

      <!-- Relationship Summary -->
      <div class="profile-tab-content" id="tab-summary" style="display:none;">
        <div id="summaryContent"><p class="empty-msg">Loading...</p></div>
      </div>

      <!-- Stats -->
      <div class="profile-tab-content" id="tab-stats" style="display:none;">
        <div id="statsContent"><p class="empty-msg">Loading...</p></div>
      </div>

      <!-- Preferences -->
      <div class="profile-tab-content" id="tab-prefs" style="display:none;">
        <div class="pref-row">
          <div>
            <p class="pref-title">Notify me when partner writes</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="prefNotifyEntry">
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="pref-row">
          <div>
            <p class="pref-title">Notify me about new plans</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="prefNotifyPlan">
            <span class="toggle-slider"></span>
          </label>
        </div>

        <label class="profile-label">Remind me if I haven't written in (days)</label>
        <input type="number" id="prefReminderDays" class="pair-input security-input" min="1" max="30">

        <label class="profile-label">Theme accent color</label>
        <select id="prefTheme" class="event-select">
          <option value="pink">Pink</option>
          <option value="purple">Purple</option>
          <option value="blue">Blue</option>
        </select>
         <div class="pref-row">
          <div>
            <p class="pref-title">Dark Mode</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="prefDarkMode">
            <span class="toggle-slider"></span>
          </label>
        </div>
        <label class="profile-label">My diary entries unlock after (days)</label>
        <input type="number" id="prefUnlockDays" class="pair-input security-input" min="1" max="365">

        <button id="savePrefsBtn" class="huge-btn primary panel-submit-btn">Save Preferences</button>
        <p id="prefsMsg" class="write-msg" style="display:none;"></p>
      </div>

      <!-- Security & Account -->
      <div class="profile-tab-content" id="tab-security" style="display:none;">
        <p class="section-label">Change Password</p>
        <label class="profile-label">Current Password</label>
        <input type="password" id="currentPasswordInput" class="pair-input security-input">
        <label class="profile-label">New Password</label>
        <input type="password" id="newPasswordInput" class="pair-input security-input">
        <label class="profile-label">Confirm New Password</label>
        <input type="password" id="confirmNewPasswordInput" class="pair-input security-input">
        <button id="changePasswordBtn" class="huge-btn primary panel-submit-btn">Change Password</button>
        <p id="securityMsg" class="write-msg" style="display:none;"></p>

        <p class="section-label" style="margin-top:25px;">Change Email</p>
        <label class="profile-label">New Email</label>
        <input type="email" id="newEmailInput" class="pair-input security-input">
        <label class="profile-label">Current Password</label>
        <input type="password" id="emailPasswordInput" class="pair-input security-input">
        <button id="changeEmailBtn" class="huge-btn primary panel-submit-btn">Update Email</button>
        <p id="emailMsg" class="write-msg" style="display:none;"></p>

        <p class="section-label" style="margin-top:25px;">Account</p>
        <button id="logoutBtn" class="huge-btn primary panel-submit-btn logout-btn"><i class='bx bx-log-out'></i> Log Out</button>

        <p class="section-label danger-label" style="margin-top:25px;">Danger Zone</p>
        <button id="unpairBtn" class="danger-btn"><i class='bx bx-unlink'></i> Unpair from Partner</button>
        <button id="deleteAccountBtn" class="danger-btn"><i class='bx bx-trash'></i> Delete My Account</button>
        <p id="dangerMsg" class="write-msg" style="display:none;"></p>
      </div>
     <!-- Inbox -->
      <div class="profile-tab-content" id="tab-inbox" style="display:none;">
        <div id="inboxContent"><p class="empty-msg">Loading...</p></div>
      </div>
  `;
}

function openProfilePanel() {
  document.getElementById("profileOverlay").classList.add("open");
  document.getElementById("profilePanel").classList.add("open");
  loadProfileIntoPanel();
}

function closeProfilePanel() {
  document.getElementById("profileOverlay").classList.remove("open");
  document.getElementById("profilePanel").classList.remove("open");
}

async function loadProfileIntoPanel() {
  try {
    const res = await fetch(`${PROFILE_API}/api/profile/me`, { headers: profileHeaders });
    const data = await res.json();
    if (!res.ok) return;

    document.getElementById("bioInput").value = data.user.bio || "";
    document.getElementById("bioCount").textContent = (data.user.bio || "").length;
    document.getElementById("firstNameInput").value = data.user.firstName || "";
    document.getElementById("lastNameInput").value = data.user.lastName || "";
    if (data.user.profilePicture) {
      document.getElementById("avatarPreview").src = data.user.profilePicture;
      document.getElementById("avatarPreview").style.display = "block";
      document.getElementById("avatarPlaceholder").style.display = "none";
      document.getElementById("removePictureBtn").style.display = "block";
    } else {
      document.getElementById("avatarPreview").style.display = "none";
      document.getElementById("avatarPlaceholder").style.display = "flex";
      document.getElementById("removePictureBtn").style.display = "none";
    }
    const prefs = data.user.preferences || {};
    document.getElementById("prefNotifyEntry").checked = prefs.notifyOnEntry !== false;
    document.getElementById("prefNotifyPlan").checked = prefs.notifyOnPlan !== false;
    document.getElementById("prefReminderDays").value = prefs.reminderDays ?? 3;
    document.getElementById("prefTheme").value = prefs.theme || "pink";
    document.getElementById("prefUnlockDays").value = prefs.unlockDays ?? 30;
    document.getElementById("prefDarkMode").checked = localStorage.getItem("darkMode") === "true";
  } catch (err) {
    // silently fail, panel just shows blank fields
  }
}

async function loadSummaryTab() {
  const el = document.getElementById("summaryContent");
  try {
    const res = await fetch(`${PROFILE_API}/api/profile/summary`, { headers: profileHeaders });
    const data = await res.json();

    if (!data.paired) {
      el.innerHTML = '<p class="empty-msg">Pair with someone from the Home page to see your relationship summary.</p>';
      return;
    }

    const pairedDate = new Date(data.pairedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    el.innerHTML = `
      <div class="summary-card">
        <p class="summary-names">${escapeHtmlP(data.me.firstName)} 💕 ${escapeHtmlP(data.partner.firstName)}</p>
        <p class="summary-since">Together since ${pairedDate}</p>
      </div>
      <div class="summary-bio-block">
        <p class="profile-label">Your bio</p>
        <p class="entry-content">${escapeHtmlP(data.me.bio) || "<i>No bio yet</i>"}</p>
      </div>
      <div class="summary-bio-block">
        <p class="profile-label">${escapeHtmlP(data.partner.firstName)}'s bio</p>
        <p class="entry-content">${escapeHtmlP(data.partner.bio) || "<i>No bio yet</i>"}</p>
      </div>
    `;
  } catch (err) {
    el.innerHTML = '<p class="empty-msg">Could not load summary.</p>';
  }
}

async function loadStatsTab() {
  const el = document.getElementById("statsContent");
  try {
    const res = await fetch(`${PROFILE_API}/api/profile/stats`, { headers: profileHeaders });
    const data = await res.json();

    el.innerHTML = `
      <div class="stats-grid">
        <div class="stat-box">
          <p class="stat-value">${data.writingStreak}</p>
          <p class="stat-label">Day streak 🔥</p>
        </div>
        <div class="stat-box">
          <p class="stat-value">${data.totalEntries}</p>
          <p class="stat-label">Entries written</p>
        </div>
        <div class="stat-box">
          <p class="stat-value">${data.confirmedPlans}</p>
          <p class="stat-label">Plans together</p>
        </div>
        <div class="stat-box">
          <p class="stat-value">${data.totalPlans}</p>
          <p class="stat-label">Plans proposed</p>
        </div>
      </div>
    `;
  } catch (err) {
    el.innerHTML = '<p class="empty-msg">Could not load stats.</p>';
  }
}
async function loadInboxTab() {
  const el = document.getElementById("inboxContent");
  try {
    const res = await fetch(`${PROFILE_API}/api/notifications`, { headers: profileHeaders });
    const data = await res.json();

    el.innerHTML =
      data.notifications
        .map((n) => `<div class="entry-card"><p class="entry-content">${n.text}</p></div>`)
        .join("") || '<p class="empty-msg">Your inbox is empty for now.</p>';

    await fetch(`${PROFILE_API}/api/notifications/mark-read`, { method: "POST", headers: profileHeaders });
    document.getElementById("profileBtn")?.classList.remove("has-badge");
  } catch (err) {
    el.innerHTML = '<p class="empty-msg">Could not load notifications.</p>';
  }
}
function escapeHtmlP(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function initProfilePanel() {
  document.body.insertAdjacentHTML("beforeend", buildProfilePanelHTML());
    document.getElementById("prefDarkMode").addEventListener("change", (e) => {
    toggleDarkMode(e.target.checked);
  });
  // Floating chat button, placed just below the profile icon
  if (!document.getElementById("chatFloatBtn")) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `<button id="chatFloatBtn" class="chat-float-btn" title="Chat"><i class='bx bxs-message-dots'></i></button>`
    );
    document.getElementById("chatFloatBtn").addEventListener("click", () => {
      window.location.href = "chat.html";
    });
  }
// Floating community button, placed below the chat button
  if (!document.getElementById("communityFloatBtn")) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `<button id="communityFloatBtn" class="community-float-btn" title="Community"><i class='bx bxs-group'></i></button>`
    );
    document.getElementById("communityFloatBtn").addEventListener("click", () => {
      window.location.href = "community.html";
    });
  }
  document.getElementById("profileBtn")?.addEventListener("click", openProfilePanel);
  document.getElementById("profileCloseBtn").addEventListener("click", closeProfilePanel);
  document.getElementById("profileOverlay").addEventListener("click", closeProfilePanel);
    // Avatar upload preview
  document.getElementById("avatarInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      document.getElementById("avatarPreview").src = reader.result;
      document.getElementById("avatarPreview").style.display = "block";
      document.getElementById("avatarPlaceholder").style.display = "none";
      document.getElementById("removePictureBtn").style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  // Remove picture
  document.getElementById("removePictureBtn").addEventListener("click", () => {
    document.getElementById("avatarPreview").src = "";
    document.getElementById("avatarPreview").style.display = "none";
    document.getElementById("avatarPlaceholder").style.display = "flex";
    document.getElementById("removePictureBtn").style.display = "none";
  });
  // Tabs
  document.querySelectorAll(".profile-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".profile-tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".profile-tab-content").forEach((c) => (c.style.display = "none"));
      tab.classList.add("active");
      document.getElementById(`tab-${tab.dataset.tab}`).style.display = "block";

      if (tab.dataset.tab === "summary") loadSummaryTab();
      if (tab.dataset.tab === "stats") loadStatsTab();
      if (tab.dataset.tab === "inbox") loadInboxTab();
    });
  });

  // Bio char count
  document.getElementById("bioInput").addEventListener("input", (e) => {
    document.getElementById("bioCount").textContent = e.target.value.length;
  });

  // Avatar upload preview

  // Save profile
        document.getElementById("saveProfileBtn").addEventListener("click", async () => {
    const msgEl = document.getElementById("profileMsg");
    const bio = document.getElementById("bioInput").value;
    const firstName = document.getElementById("firstNameInput").value;
    const lastName = document.getElementById("lastNameInput").value;
    const avatarVisible = document.getElementById("avatarPreview").style.display !== "none";
    const profilePicture = avatarVisible ? document.getElementById("avatarPreview").src : "";

    try {
      const res = await fetch(`${PROFILE_API}/api/profile`, {
        method: "PUT",
        headers: profileHeaders,
        body: JSON.stringify({ bio, firstName, lastName, profilePicture }),
      });
      if (profilePicture !== undefined) user.profilePicture = profilePicture;
      const data = await res.json();
      msgEl.style.display = "block";
      msgEl.textContent = res.ok ? "Saved!" : data.message;
    } catch (err) {
      msgEl.style.display = "block";
      msgEl.textContent = "Could not reach the server.";
    }
  });

  // Save preferences
  document.getElementById("savePrefsBtn").addEventListener("click", async () => {
    const msgEl = document.getElementById("prefsMsg");
    try {
      const res = await fetch(`${PROFILE_API}/api/profile/preferences`, {
        method: "PUT",
        headers: profileHeaders,
        body: JSON.stringify({
          notifyOnEntry: document.getElementById("prefNotifyEntry").checked,
          notifyOnPlan: document.getElementById("prefNotifyPlan").checked,
          reminderDays: Number(document.getElementById("prefReminderDays").value),
          theme: document.getElementById("prefTheme").value,
          unlockDays: Number(document.getElementById("prefUnlockDays").value),
        }),
      });
      const data = await res.json();
      msgEl.style.display = "block";
      msgEl.textContent = res.ok ? "Preferences saved!" : data.message;
    } catch (err) {
      msgEl.style.display = "block";
      msgEl.textContent = "Could not reach the server.";
    }
  });

  // Change password
  document.getElementById("changePasswordBtn").addEventListener("click", async () => {
    const msgEl = document.getElementById("securityMsg");
    msgEl.style.display = "none";
    const currentPassword = document.getElementById("currentPasswordInput").value;
    const newPassword = document.getElementById("newPasswordInput").value;
    const confirmNewPassword = document.getElementById("confirmNewPasswordInput").value;

    if (newPassword !== confirmNewPassword) {
      msgEl.style.display = "block";
      msgEl.textContent = "New passwords don't match.";
      return;
    }

    try {
      const res = await fetch(`${PROFILE_API}/api/profile/password`, {
        method: "PUT",
        headers: profileHeaders,
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      msgEl.style.display = "block";
      msgEl.textContent = data.message;
      if (res.ok) {
        document.getElementById("currentPasswordInput").value = "";
        document.getElementById("newPasswordInput").value = "";
        document.getElementById("confirmNewPasswordInput").value = "";
      }
    } catch (err) {
      msgEl.style.display = "block";
      msgEl.textContent = "Could not reach the server.";
    }
  });

  // Change email
  document.getElementById("changeEmailBtn").addEventListener("click", async () => {
    const msgEl = document.getElementById("emailMsg");
    const newEmail = document.getElementById("newEmailInput").value;
    const currentPassword = document.getElementById("emailPasswordInput").value;

    try {
      const res = await fetch(`${PROFILE_API}/api/profile/email`, {
        method: "PUT",
        headers: profileHeaders,
        body: JSON.stringify({ newEmail, currentPassword }),
      });
      const data = await res.json();
      msgEl.style.display = "block";
      msgEl.textContent = data.message;
      if (res.ok) {
        document.getElementById("newEmailInput").value = "";
        document.getElementById("emailPasswordInput").value = "";
      }
    } catch (err) {
      msgEl.style.display = "block";
      msgEl.textContent = "Could not reach the server.";
    }
  });

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    if (!confirm("Log out of Cupinul?")) return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "structure.html";
  });

  // Unpair
  document.getElementById("unpairBtn").addEventListener("click", async () => {
    const msgEl = document.getElementById("dangerMsg");
    if (!confirm("Unpair from your partner? Your diary entries stay, but you'll need to pair again to see each other's.")) return;

    try {
      const res = await fetch(`${PROFILE_API}/api/profile/unpair`, { method: "POST", headers: profileHeaders });
      const data = await res.json();
      msgEl.style.display = "block";
      msgEl.textContent = data.message;
      if (res.ok) setTimeout(() => window.location.href = "home.html", 1200);
    } catch (err) {
      msgEl.style.display = "block";
      msgEl.textContent = "Could not reach the server.";
    }
  });

  // Delete account
  document.getElementById("deleteAccountBtn").addEventListener("click", async () => {
    const msgEl = document.getElementById("dangerMsg");
    const pwd = prompt("This permanently deletes your account. Enter your password to confirm:");
    if (!pwd) return;

    try {
      const res = await fetch(`${PROFILE_API}/api/profile`, {
        method: "DELETE",
        headers: profileHeaders,
        body: JSON.stringify({ currentPassword: pwd }),
      });
      const data = await res.json();
      msgEl.style.display = "block";
      msgEl.textContent = data.message;
      if (res.ok) {
        localStorage.removeItem("token");
        setTimeout(() => window.location.href = "structure.html", 1200);
      }
    } catch (err) {
      msgEl.style.display = "block";
      msgEl.textContent = "Could not reach the server.";
    }
  });
}
checkUnreadBadge();
  setInterval(checkUnreadBadge, 30000); // poll every 30s
document.addEventListener("DOMContentLoaded", initProfilePanel);
async function checkUnreadBadge() {
  try {
    const res = await fetch(`${PROFILE_API}/api/notifications`, { headers: profileHeaders });
    const data = await res.json();
    document.getElementById("profileBtn")?.classList.toggle("has-badge", data.unreadCount > 0);
  } catch (err) {}

  try {
    const res2 = await fetch(`${PROFILE_API}/api/community/unread`, { headers: profileHeaders });
    const data2 = await res2.json();
    document.getElementById("communityFloatBtn")?.classList.toggle("has-badge", data2.hasNew);
  } catch (err) {}
}