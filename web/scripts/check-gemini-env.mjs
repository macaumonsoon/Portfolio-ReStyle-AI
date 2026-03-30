#!/usr/bin/env node
/**
 * 檢查 web/.env.local 裡 GEMINI_API_KEY 是否非空（不打印金鑰內容）。
 * 用法：在 web 目錄執行 node scripts/check-gemini-env.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const envPath = path.join(root, ".env.local");

if (!fs.existsSync(envPath)) {
  console.error("❌ 找不到 web/.env.local，請在 web 資料夾內建立此檔案。");
  process.exit(1);
}

const raw = fs.readFileSync(envPath, "utf8");
const lines = raw.split(/\r?\n/);
let value = "";
for (const line of lines) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const m = t.match(/^GEMINI_API_KEY\s*=\s*(.*)$/);
  if (m) {
    value = (m[1] ?? "").trim();
    break;
  }
}

if (!value) {
  console.error(
    "❌ GEMINI_API_KEY 為空：請在 .env.local 裡把金鑰寫在 GEMINI_API_KEY= 的右側（同一行），存檔後重啟 npm run dev。",
  );
  process.exit(1);
}

console.log(
  `✅ 已偵測到 GEMINI_API_KEY（長度 ${value.length}）。若網頁仍報錯，請確認已重啟 dev 且未加引號。`,
);
process.exit(0);
