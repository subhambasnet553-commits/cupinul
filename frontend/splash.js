// If already logged in, skip the splash entirely
if (localStorage.getItem("token")) {
  window.location.href = "home.html";
}

// Rising sparkle/heart particles for extra polish
function spawnParticles() {
  const container = document.getElementById("splashParticles");
  if (!container) return;
  const symbols = ["♥", "✦", "♥", "✧"];

  for (let i = 0; i < 16; i++) {
    const p = document.createElement("span");
    p.className = "splash-particle";
    p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    p.style.left = `${Math.random() * 100}%`;
    p.style.fontSize = `${8 + Math.random() * 14}px`;
    p.style.animationDelay = `${Math.random() * 4}s`;
    p.style.animationDuration = `${4 + Math.random() * 3}s`;
    container.appendChild(p);
  }
}
spawnParticles();

function goToLogin() {
  const wrap = document.getElementById("splashWrap");
  wrap.classList.add("splash-fade-out");
  setTimeout(() => {
    window.location.href = "structure.html";
  }, 500);
}

// Auto-advance after the animation plays out
const AUTO_ADVANCE_MS = 4200;
const autoTimer = setTimeout(goToLogin, AUTO_ADVANCE_MS);

// Let people skip it by tapping/clicking anywhere
document.addEventListener("click", () => {
  clearTimeout(autoTimer);
  goToLogin();
});
