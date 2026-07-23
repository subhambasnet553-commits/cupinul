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
const gallerySection = document.getElementById("gallerySection");

let compressedImageData = null;
let currentPhotos = [];

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
          <p class="title" style="font-size:20px;">Gallery is a Premium feature</p>
          <p class="entry-content">Unlock Gallery & Bucket List for ₹40.</p>
          <a href="home.html" class="cacc entry-submit-btn" style="display:inline-block; text-decoration:none;">Go to Home to Unlock</a>
        </div>`;
      return;
    }
    loadingState.style.display = "none";
    gallerySection.style.display = "block";
    loadPhotos();
  } catch (err) {
    loadingState.innerHTML = '<p class="title">Could not reach the server.</p>';
  }
}
init();

document.getElementById("addPhotoBtn").addEventListener("click", () => {
  document.getElementById("uploadForm").style.display =
    document.getElementById("uploadForm").style.display === "block" ? "none" : "block";
});

// Compress the image client-side (resize + JPEG) before turning it into base64
document.getElementById("photoInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const MAX_DIM = 1200;
      let { width, height } = img;
      if (width > height && width > MAX_DIM) {
        height = Math.round((height * MAX_DIM) / width);
        width = MAX_DIM;
      } else if (height > MAX_DIM) {
        width = Math.round((width * MAX_DIM) / height);
        height = MAX_DIM;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);

      compressedImageData = canvas.toDataURL("image/jpeg", 0.8);
      const preview = document.getElementById("photoPreview");
      preview.src = compressedImageData;
      preview.style.display = "block";
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

document.getElementById("submitPhotoBtn").addEventListener("click", async () => {
  const msgEl = document.getElementById("uploadMsg");
  const eventName = document.getElementById("eventNameInput").value.trim();
  const date = document.getElementById("eventDateInput").value;

  if (!compressedImageData || !eventName || !date) {
    msgEl.style.display = "block";
    msgEl.textContent = "Please choose a photo, add a title, and pick a date.";
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/gallery/photos`, {
      method: "POST",
      headers,
      body: JSON.stringify({ imageData: compressedImageData, eventName, date }),
    });
    const data = await res.json();
    msgEl.style.display = "block";
    msgEl.textContent = data.message;

    if (res.ok) {
      document.getElementById("photoInput").value = "";
      document.getElementById("photoPreview").style.display = "none";
      document.getElementById("eventNameInput").value = "";
      document.getElementById("eventDateInput").value = "";
      compressedImageData = null;
      document.getElementById("uploadForm").style.display = "none";
      loadPhotos();
    }
  } catch (err) {
    msgEl.style.display = "block";
    msgEl.textContent = "Could not reach the server.";
  }
});

async function loadPhotos() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/gallery/photos`, { headers });
    const data = await res.json();
    currentPhotos = data.photos;

    const grid = document.getElementById("photoGrid");
    grid.innerHTML =
      currentPhotos
        .map(
          (p, i) => `
        <div class="photo-thumb" data-index="${i}">
          <img src="${p.imageData}" alt="${escapeHtml(p.eventName)}">
          <div class="photo-thumb-overlay">
            <p>${escapeHtml(p.eventName)}</p>
          </div>
        </div>`
        )
        .join("") || '<p class="empty-msg">No photos yet — add your first memory above!</p>';

    document.querySelectorAll(".photo-thumb").forEach((el) =>
      el.addEventListener("click", () => openLightbox(Number(el.dataset.index)))
    );
  } catch (err) {
    document.getElementById("photoGrid").innerHTML = '<p class="empty-msg">Could not load photos.</p>';
  }
}

function openLightbox(index) {
  const photo = currentPhotos[index];
  document.getElementById("lightboxImg").src = photo.imageData;
  document.getElementById("lightboxCaption").textContent = `${photo.eventName} — ${formatDate(photo.date)}`;
  document.getElementById("lightboxDelete").style.display = photo.addedByMe ? "flex" : "none";
  document.getElementById("lightboxDelete").dataset.id = photo.id;
  document.getElementById("lightbox").style.display = "flex";
}

document.getElementById("lightboxClose").addEventListener("click", () => {
  document.getElementById("lightbox").style.display = "none";
});

document.getElementById("lightboxDelete").addEventListener("click", async (e) => {
  const id = e.currentTarget.dataset.id;
  if (!confirm("Delete this photo?")) return;

  try {
    await fetch(`${API_BASE_URL}/api/gallery/photos/${id}`, { method: "DELETE", headers });
    document.getElementById("lightbox").style.display = "none";
    loadPhotos();
  } catch (err) {
    alert("Could not reach the server.");
  }
});

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
