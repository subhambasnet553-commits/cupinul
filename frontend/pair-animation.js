// Plays a ~4 second "pairing" animation: two glossy 3D-style hearts fly in
// from either side, float around each other, then merge into one heart
// with a soft burst of light. Calls `onComplete` when it's done.

function playPairAnimation(onComplete) {
  const overlay = document.createElement("div");
  overlay.className = "pair-anim-overlay";
  overlay.innerHTML = `
    <div class="pair-anim-flash"></div>
    <svg class="pair-anim-heart pair-anim-heart-left" viewBox="0 0 200 180">
      <defs>
        <radialGradient id="heartGradLeft" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stop-color="#ffb3d1"/>
          <stop offset="45%" stop-color="#ff4f93"/>
          <stop offset="100%" stop-color="#c4126b"/>
        </radialGradient>
      </defs>
      <path d="M100,170 C40,120 10,80 10,50 C10,20 35,5 60,5 C80,5 95,20 100,35 C105,20 120,5 140,5 C165,5 190,20 190,50 C190,80 160,120 100,170 Z" fill="url(#heartGradLeft)"/>
      <ellipse cx="65" cy="45" rx="22" ry="14" fill="rgba(255,255,255,0.55)" />
    </svg>
    <svg class="pair-anim-heart pair-anim-heart-right" viewBox="0 0 200 180">
      <defs>
        <radialGradient id="heartGradRight" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stop-color="#ffb3d1"/>
          <stop offset="45%" stop-color="#ff4f93"/>
          <stop offset="100%" stop-color="#c4126b"/>
        </radialGradient>
      </defs>
      <path d="M100,170 C40,120 10,80 10,50 C10,20 35,5 60,5 C80,5 95,20 100,35 C105,20 120,5 140,5 C165,5 190,20 190,50 C190,80 160,120 100,170 Z" fill="url(#heartGradRight)"/>
      <ellipse cx="65" cy="45" rx="22" ry="14" fill="rgba(255,255,255,0.55)" />
    </svg>
    <svg class="pair-anim-heart pair-anim-heart-merged" viewBox="0 0 200 180">
      <defs>
        <radialGradient id="heartGradMerged" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stop-color="#ffd0e3"/>
          <stop offset="45%" stop-color="#ff5c9d"/>
          <stop offset="100%" stop-color="#b8005c"/>
        </radialGradient>
      </defs>
      <path d="M100,170 C40,120 10,80 10,50 C10,20 35,5 60,5 C80,5 95,20 100,35 C105,20 120,5 140,5 C165,5 190,20 190,50 C190,80 160,120 100,170 Z" fill="url(#heartGradMerged)"/>
      <ellipse cx="65" cy="45" rx="26" ry="17" fill="rgba(255,255,255,0.6)" />
    </svg>
  `;
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.classList.add("pair-anim-fade-out");
    setTimeout(() => {
      overlay.remove();
      if (onComplete) onComplete();
    }, 500);
  }, 4000);
}