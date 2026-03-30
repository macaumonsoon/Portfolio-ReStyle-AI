import type { NextConfig } from "next";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /** 部分依賴為 ESM / 混合格式，預編譯可避免 Webpack runtime 取模組時出錯 */
  transpilePackages: [
    "pdfjs-dist",
    "jspdf",
    "svg2pdf.js",
    "three",
    "@react-three/fiber",
    "@react-three/drei",
  ],
  /**
   * 關閉 Next 15 預設的 Segment Explorer，避免 dev 下
   *「React Client Manifest / SegmentViewNode」與後續 chunk 錯亂（樣式與客戶端腳本載入失敗時頁面會像「沒套 Tailwind」）。
   */
  experimental: {
    devtoolSegmentExplorer: false,
  },
  /** 降低 macOS 上 file watcher 數量，緩解 EMFILE；dev 用記憶體快取降低 .next/cache 損毀導致的 ENOENT / 樣式丟失 */
  webpack: (config, { dev }) => {
    /** 強制 svg2pdf.js 與業務碼共用同一份 jspdf，否則 prototype 上的 .svg 不會掛到 new jsPDF() 實例 */
    config.resolve = config.resolve ?? {};
    const alias = config.resolve.alias as Record<string, string | false | string[]>;
    config.resolve.alias = {
      ...alias,
      /** 不可指到 main（node 版會 require fs），須鎖定瀏覽器 ESM 包 */
      jspdf: require.resolve("jspdf/dist/jspdf.es.min.js"),
    };
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
