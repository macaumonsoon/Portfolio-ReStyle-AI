#!/usr/bin/env node
/**
 * 在 web/ 目錄建立 .env.local（從 .env.example 複製，已存在則跳過）。
 * 用法：cd web && npm run init:env
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dest = path.join(root, ".env.local");
const example = path.join(root, ".env.example");

if (fs.existsSync(dest)) {
  console.log("✓ 已存在，未覆寫：", dest);
  console.log("  用 Cursor 開啟：Cmd+Shift+P → 「File: Open」→ 貼上此路徑");
  process.exit(0);
}

if (!fs.existsSync(example)) {
  console.error("❌ 找不到", example);
  process.exit(1);
}

fs.copyFileSync(example, dest);
console.log("✓ 已建立：", dest);
console.log("");
console.log("下一步：");
console.log("  1. 用編輯器打開上述檔案，在 GEMINI_API_KEY= 右側貼上金鑰");
console.log("  2. 終端 Ctrl+C 後重新 npm run dev");
console.log("");
console.log("若 Cmd+P 搜不到檔名：檔名是 .env.local（前面有點），且必須在 web 資料夾內。");
