import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

/** 不使用 next/font/google，避免建置/SSR 時連線 Google 失敗導致 500（部分網路環境） */
export const metadata: Metadata = {
  title: "Portfolio ReStyle AI",
  description:
    "AI 驅動作品集重設計：上傳 SVG、選擇風格與色系、逐頁三選一、Before/After 對比、匯出 SVG。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
