const API_BASE_URL = "";

const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "structure.html";
}

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

const RING_CIRCUMFERENCE = 2 * Math.PI * 52; // matches r="52" in the SVG

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
    const premRes = await fetch(`${API_BASE_URL}/api/payment/status`, { headers });
    const premData = await premRes.json();
    if (!premData.isPremium) {
      document.getElementById("loadingState").innerHTML = `
        <div class="premium-lock-screen">
          <i class='bx bxs-lock-alt'></i>
          <p class="title" style="font-size:20px;">Bucket List is a Premium feature</p>
          <p class="entry-content">Unlock Gallery & Bucket List for ₹40.</p>
          <a href="home.html" class="cacc entry-submit-btn" style="display:inline-block; text-decoration:none;">Go to Home to Unlock</a>
        </div>`;
      return;
    }
    document.getElementById("loadingState").style.display = "none";
    document.getElementById("bucketSection").style.display = "block";
    loadItems();
  } catch (err) {
    document.getElementById("loadingState").innerHTML = '<p class="title">Could not reach the server.</p>';
  }
}
init();

document.getElementById("bucketForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("bucketInput");
  const text = input.value.trim();
  if (!text) return;

  try {
    await fetch(`${API_BASE_URL}/api/bucket/items`, {
      method: "POST",
      headers,
      body: JSON.stringify({ text }),
    });
    input.value = "";
    loadItems();
  } catch (err) {
    alert("Could not reach the server.");
  }
});

async function loadItems() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/bucket/items`, { headers });
    const data = await res.json();

    updateRing(data.percent, data.completed, data.total);

    const listEl = document.getElementById("bucketList");
    listEl.innerHTML =
      data.items
        .map(
          (item) => `
        <div class="entry-card bucket-item ${item.completed ? "bucket-item-done" : ""}">
          <label class="bucket-check-label">
            <input type="checkbox" class="bucket-checkbox" data-id="${item.id}" ${item.completed ? "checked" : ""}>
            <span class="bucket-checkmark"></span>
            <span class="bucket-item-text">${escapeHtml(item.text)}</span>
          </label>
          <button class="bucket-delete-btn" data-id="${item.id}"><i class='bx bx-trash'></i></button>
        </div>`
        )
        .join("") || '<p class="empty-msg">Nothing here yet — add your first dream together!</p>';

    document.querySelectorAll(".bucket-checkbox").forEach((cb) =>
      cb.addEventListener("change", () => toggleItem(cb.dataset.id))
    );
    document.querySelectorAll(".bucket-delete-btn").forEach((btn) =>
      btn.addEventListener("click", () => deleteItem(btn.dataset.id))
    );
  } catch (err) {
    document.getElementById("bucketList").innerHTML = '<p class="empty-msg">Could not load your list.</p>';
  }
}

function updateRing(percent, completed, total) {
  const fill = document.getElementById("bucketRingFill");
  const offset = RING_CIRCUMFERENCE - (percent / 100) * RING_CIRCUMFERENCE;
  fill.style.strokeDasharray = RING_CIRCUMFERENCE;
  fill.style.strokeDashoffset = offset;

  document.getElementById("bucketPercent").textContent = `${percent}%`;
  document.getElementById("bucketFraction").textContent = `${completed} / ${total}`;
}

async function toggleItem(id) {
  try {
    await fetch(`${API_BASE_URL}/api/bucket/items/${id}/toggle`, { method: "PUT", headers });
    loadItems();
  } catch (err) {
    alert("Could not reach the server.");
  }
}

async function deleteItem(id) {
  try {
    await fetch(`${API_BASE_URL}/api/bucket/items/${id}`, { method: "DELETE", headers });
    loadItems();
  } catch (err) {
    alert("Could not reach the server.");
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}