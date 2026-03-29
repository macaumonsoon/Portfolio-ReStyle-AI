import { NextResponse } from "next/server";

/**
 * 佔位 middleware，讓 dev/build 穩定產生 `middleware-manifest.json`。
 * matcher 必須排除整個 `/_next/`（含 CSS/JS chunk），否則 dev 下樣式偶發無法載入、頁面像純 HTML。
 */
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|mjs|map|woff2?|ttf|eot)$).*)",
  ],
};
