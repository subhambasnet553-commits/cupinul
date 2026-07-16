const API_BASE_URL = "";

const pendingEmail = sessionStorage.getItem("pendingVerificationEmail");
if (!pendingEmail) {
  window.location.href = "structure.html";
}

document.getElementById("otpSubtitle").textContent = `Enter the 6-digit code we sent to ${pendingEmail}.`;

document.getElementById("verifyBtn").addEventListener("click", async () => {
  const errorEl = document.getElementById("otpError");
  errorEl.style.display = "none";
  const otp = document.getElementById("otpInput").value.trim();

  if (otp.length !== 6) {
    errorEl.textContent = "Enter the full 6-digit code.";
    errorEl.style.display = "block";
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: pendingEmail, otp }),
    });
    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.message || "Could not verify code.";
      errorEl.style.display = "block";
      return;
    }

    sessionStorage.removeItem("pendingVerificationEmail");
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    window.location.href = data.user.onboarded ? "home.html" : "onboarding.html";
  } catch (err) {
    errorEl.textContent = "Could not reach the server.";
    errorEl.style.display = "block";
  }
});

document.getElementById("resendLink").addEventListener("click", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("otpError");
  errorEl.style.display = "none";
  const link = document.getElementById("resendLink");
  link.textContent = "Sending...";

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: pendingEmail }),
    });
    const data = await res.json();
    link.textContent = res.ok ? "Sent! Resend code" : "Resend code";

    if (!res.ok) {
      errorEl.textContent = data.message;
      errorEl.style.display = "block";
    }
  } catch (err) {
    link.textContent = "Resend code";
    errorEl.textContent = "Could not reach the server.";
    errorEl.style.display = "block";
  }
});

// Only allow digits in the OTP box
document.getElementById("otpInput").addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "");
});
