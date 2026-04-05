/**
 * Single place to set the live Next.js app URL (after Vercel deploy).
 * 部署 Vercel 後只需改這裡一處，再 push；首頁與 try-app 會自動套用。
 *
 * In Vercel: import repo → Root Directory = `web` → deploy. Your URL is shown on the dashboard.
 */
(function () {
  var PRSA_PRODUCTION_APP_URL = "https://portfolio-restyle-ai.vercel.app";

  function apply() {
    document.querySelectorAll("a[data-prsa-live-app]").forEach(function (el) {
      el.setAttribute("href", PRSA_PRODUCTION_APP_URL);
    });
    document.querySelectorAll("[data-prsa-live-url-text]").forEach(function (el) {
      el.textContent = PRSA_PRODUCTION_APP_URL;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
