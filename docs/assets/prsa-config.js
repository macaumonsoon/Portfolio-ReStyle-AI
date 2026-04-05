/**
 * Live Next.js app URL (Vercel Production).
 *
 * - Leave PRSA_PRODUCTION_APP_URL as "" until you have a working deploy.
 *   Then paste the exact URL from Vercel (e.g. https://portfolio-restyle-ai-xxx.vercel.app).
 * - While empty, "online" buttons open Vercel’s import flow for this GitHub repo
 *   (you must set Root Directory to `web` in the Vercel project settings).
 *
 * 正式網址請貼 Vercel 控制台 Production；留空時紫色按鈕改為前往導入倉庫（Root Directory 選 web）。
 */
(function () {
  var PRSA_PRODUCTION_APP_URL = "https://restyle-ai-portfolio.vercel.app";

  var PRSA_VERCEL_CLONE =
    "https://vercel.com/new/clone?repository-url=" +
    encodeURIComponent("https://github.com/macaumonsoon/Portfolio-ReStyle-AI");

  function hasLiveUrl() {
    var u = (PRSA_PRODUCTION_APP_URL || "").trim();
    return u.length > 8 && /^https?:\/\//i.test(u);
  }

  function apply() {
    var live = hasLiveUrl();
    var targetUrl = live ? PRSA_PRODUCTION_APP_URL.trim() : PRSA_VERCEL_CLONE;

    document.querySelectorAll("a[data-prsa-live-app]").forEach(function (el) {
      el.setAttribute("href", targetUrl);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    });

    document.querySelectorAll("[data-prsa-live-url-text]").forEach(function (el) {
      if (live) {
        el.textContent = PRSA_PRODUCTION_APP_URL.trim();
      } else {
        el.textContent =
          "（尚未設定 Production URL：請先點下方紫色按鈕在 Vercel 導入本倉庫，Root Directory 填 web；部署成功後把網址貼入本檔 PRSA_PRODUCTION_APP_URL）";
      }
    });

    document.querySelectorAll("[data-prsa-live-app-label-live]").forEach(function (el) {
      el.style.display = live ? "" : "none";
    });
    document.querySelectorAll("[data-prsa-live-app-label-deploy]").forEach(function (el) {
      el.style.display = live ? "none" : "";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
