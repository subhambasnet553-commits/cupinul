// Scatters a random handful of soft floating hearts and sparkles across the
// page each time it loads — purely decorative, matches the pink/white theme.

const DECOR_ICONS = ["bx bxs-heart", "bx bx-heart", "bx bxs-star", "bx bx-star"];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function spawnDecor() {
  const count = Math.floor(randomBetween(9, 14)); // random amount each load

  for (let i = 0; i < count; i++) {
    const el = document.createElement("i");
    const icon = DECOR_ICONS[Math.floor(Math.random() * DECOR_ICONS.length)];
    el.className = `decor-item ${icon}`;

    // Keep them mostly around the edges so they don't sit on top of the card,
    // but still randomize freely within that band.
    const onLeftOrTop = Math.random() < 0.5;
    let top, left;
    if (onLeftOrTop) {
      top = `${randomBetween(2, 96)}%`;
      left = Math.random() < 0.5 ? `${randomBetween(1, 18)}%` : `${randomBetween(82, 98)}%`;
    } else {
      left = `${randomBetween(2, 96)}%`;
      top = Math.random() < 0.5 ? `${randomBetween(1, 15)}%` : `${randomBetween(85, 98)}%`;
    }

    el.style.top = top;
    el.style.left = left;
    el.style.fontSize = `${randomBetween(14, 34)}px`;
    el.style.animationDelay = `${randomBetween(0, 4)}s`;
    el.style.animationDuration = `${randomBetween(6, 11)}s`;
    el.style.opacity = randomBetween(0.2, 0.45);
    document.body.appendChild(el);
  }
}

document.addEventListener("DOMContentLoaded", spawnDecor);
