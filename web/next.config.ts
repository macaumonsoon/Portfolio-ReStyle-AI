import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["pdfjs-dist"],
  /**
   * 關閉 Next 15 預設的 Segment Explorer，避免 dev 下
   *「React Client Manifest / SegmentViewNode」與後續 chunk 錯亂（樣式與客戶端腳本載入失敗時頁面會像「沒套 Tailwind」）。
   */
  experimental: {
    devtoolSegmentExplorer: false,
  },
  /** 降低 macOS 上 file watcher 數量，緩解 EMFILE；dev 用記憶體快取降低 .next/cache 損毀導致的 ENOENT / 樣式丟失 */
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: "memory" };
      config.watchOptions = {
        poll: 1500,
        aggregateTimeout: 300,
        ignored: ["**/node_modules/**", "**/.git/**"],
      };
    }
    return config;
  },
};

export default nextConfig;
