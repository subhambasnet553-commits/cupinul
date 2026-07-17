// Applies dark mode instantly on every page load, based on saved preference.
(function () {
  const isDark = localStorage.getItem("darkMode") === "true";
  if (isDark) document.documentElement.classList.add("dark-mode");
})();

function toggleDarkMode(enabled) {
  localStorage.setItem("darkMode", enabled);
  document.documentElement.classList.toggle("dark-mode", enabled);
}