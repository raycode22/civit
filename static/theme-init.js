// Applies the persisted theme before first paint to avoid a flash of the
// wrong color scheme. Runs synchronously from <head>; no external requests.
(function () {
  try {
    var stored = localStorage.getItem('civit-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var resolved =
      stored === 'light' || stored === 'dark' ? stored : prefersDark ? 'dark' : 'light';
    document.documentElement.dataset.theme = resolved;
  } catch (e) {
    /* localStorage unavailable (private mode etc.) — keep default theme */
  }
})();
