// Applies the saved theme instantly on every page load (before paint),
// avoiding a flash of the wrong theme. Supports: pink (default), dark, gothic.
(function () {
  const theme = localStorage.getItem("theme") || "pink";
  if (theme !== "pink") {
    document.documentElement.classList.add(`theme-${theme}`);
  }
})();

function applyTheme(theme) {
  document.documentElement.classList.remove("theme-dark", "theme-gothic");
  localStorage.setItem("theme", theme);
  if (theme !== "pink") {
    document.documentElement.classList.add(`theme-${theme}`);
  }
}