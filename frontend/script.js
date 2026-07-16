// Empty string = relative to whatever domain the page is currently on.
// Works automatically on localhost during development and on your real
// domain once deployed (e.g. Render) — no need to change this later.
const API_BASE_URL = "";

function showError(el, message) {
  el.textContent = message;
  el.style.display = "block";
}

function hideError(el) {
  el.style.display = "none";
}

function setButtonLoading(button, isLoading, loadingText, normalText) {
  button.disabled = isLoading;
  button.textContent = isLoading ? loadingText : normalText;
}

// ---------- SIGN UP ----------
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorMsg = document.getElementById("errorMsg");
    const submitBtn = registerForm.querySelector("button[type=submit], .cacc");
    hideError(errorMsg);

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      showError(errorMsg, "Passwords do not match.");
      return;
    }

    if (submitBtn) setButtonLoading(submitBtn, true, "Creating account...", "Create Account");

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password, confirmPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        showError(errorMsg, data.message || `Could not create account (server said: ${res.status}).`);
        if (submitBtn) setButtonLoading(submitBtn, false, "", "Create Account");
        return;
      }

      // No token yet — account needs email verification first
      // Account created — go directly to profile setup
localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify(data.user));

window.location.href = "onboarding.html";
    } catch (err) {
      showError(errorMsg, "Could not reach the server. Is the backend running?");
      if (submitBtn) setButtonLoading(submitBtn, false, "", "Create Account");
    }
  });
}

// ---------- LOGIN ----------
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorMsg = document.getElementById("errorMsg");
    const submitBtn = loginForm.querySelector("button[type=submit], .login");
    hideError(errorMsg);

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      showError(errorMsg, "Enter your email and password.");
      return;
    }

    if (submitBtn) setButtonLoading(submitBtn, true, "Logging in...", "Login");

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.requiresVerification) {
          sessionStorage.setItem("pendingVerificationEmail", data.email);
          window.location.href = "verify-otp.html";
          return;
        }
        showError(errorMsg, data.message || `Login failed (server said: ${res.status}).`);
        if (submitBtn) setButtonLoading(submitBtn, false, "", "Login");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.location.href = data.user.onboarded ? "home.html" : "onboarding.html";
    } catch (err) {
      showError(errorMsg, "Could not reach the server. Is the backend running?");
      if (submitBtn) setButtonLoading(submitBtn, false, "", "Login");
    }
  });
}
