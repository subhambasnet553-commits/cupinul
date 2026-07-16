const API_BASE_URL = "";
const token = localStorage.getItem("token");
if (!token) window.location.href = "structure.html";

const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

async function proceed() {
  window.location.href = "home.html";
}

document.getElementById("saveStartDateBtn").addEventListener("click", async () => {
  const errorEl = document.getElementById("startDateError");
  const date = document.getElementById("startDateInput").value;
  if (!date) {
    errorEl.style.display = "block";
    errorEl.textContent = "Pick a date first, or tap Skip.";
    return;
  }

  try {
    await fetch(`${API_BASE_URL}/api/pair/start-date`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ date }),
    });
    proceed();
  } catch (err) {
    errorEl.style.display = "block";
    errorEl.textContent = "Could not reach the server.";
  }
});

document.getElementById("skipStartDateBtn").addEventListener("click", proceed);