#!/usr/bin/env bash
# 将本目录推送到 https://github.com/macaumonsoon/Interactive-Project
# 若提示 xcrun / Xcode 错误，请先安装命令行工具：在终端运行 xcode-select --install
set -euo pipefail
# 当系统默认 git 因 Xcode 路径失效时，优先使用 Command Line Tools / Homebrew 的 git
export PATH="/Library/Developer/CommandLineTools/usr/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
cd "$(dirname "$0")"
REMOTE="${1:-https://github.com/macaumonsoon/Interactive-Project.git}"

if ! command -v git >/dev/null 2>&1; then
  echo "未找到 git，请先安装：xcode-select --install" >&2
  exit 1
fi

git init
git branch -M main
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REMOTE"
else
  git remote add origin "$REMOTE"
fi

git add -A
if git diff --staged --quiet; then
  echo "没有需要提交的更改。"
  exit 0
fi

git commit -m "Add interactive HTML projects and MediaPipe models"
git push -u origin main
