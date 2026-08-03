# 交接檔（handoff.md）

> 任何 Agent、任何電腦接手前**必讀**；收工時**必更新**。本檔只放交接必需的精簡資訊，詳細脈絡放 Obsidian（若有 L3）。

## ⏯️ 目前做到哪
foodmap（區域地圖分支）已可透過 GitHub Actions 自動部署到 GitHub Pages，網站已上線。

## 🚦 目前狀態
- L1 本地藍圖已建立：`AGENTS.md`＋`handoff.md`
- L2 GitHub 私有 repo：`peterhupc/oc_maps`，master 分支
- L3 Obsidian 筆記：`C:\Users\peter\Obsidian\oc_maps\專案工作流程.md`

### foodmap 部署（已完成）
- 網站已上線：`https://peterhupc.github.io/oc_maps/`（HTTP 200，含 API key）
- GitHub Pages 設定：**GitHub Actions 模式**（`build_type: workflow`，不是 branch 模式）
- CI workflow：`.github/workflows/deploy.yml`（官方 `deploy-pages`）
  - 觸發：push 到 master 且路徑含 `foodmap/**`，或 `workflow_dispatch` 手動
  - 流程：`npm ci` → `npm run build`（`VITE_GMAPS_KEY: ${{ secrets.VITE_GMAPS_KEY }}`）→ `upload-pages-artifact` → `deploy-pages`
- GitHub secret `VITE_GMAPS_KEY` 已設定（用 GCM 的 PAT + libsodium 加密，非 gh CLI）
- 本機測試 key 放 `foodmap/.env.local`（已 gitignore，不含在 repo）

## ➡️ 下一步
1. 規劃主專案架構與資料夾分類（區域地圖 → 分支）
2. 後續 foodmap 變更 commit 到 master 即自動重新部署；也可用 `workflow_dispatch` 手動觸發

## ⚠️ 注意事項
- `gh` CLI 的 keyring token 仍失效（`gh auth login -h github.com` 可修），但 git push 走 Windows GCM 的 PAT，目前運作正常
- GitHub API 操作（設 secret、看 runs、觸發 dispatch）用 GCM PAT：`git credential fill` 取出後帶 `Authorization: Bearer` header
- **勿改 Pages 設定為 branch 模式**——workflow 是 `deploy-pages` 官方模式，兩者需匹配
- `package-lock.json` 曾修過 `@rolldown/binding-android-arm64` 缺 version（Windows 產生 lockfile 的 bug）；若 lockfile 重新產生要注意此 entry
- 修改共用檔案前先讀最新內容，避免覆蓋其他 Agent 的變更
- 所有回應與文件使用繁體中文

## 🕐 最後更新
- 時間：2026-08-03（foodmap 上線後）
- 更新者：opencode @ PBHOME-X1G12
- Git push：✅ 已推（peterhupc/oc_maps，master，至 241a55d）
