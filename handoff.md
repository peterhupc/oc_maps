# handoff（交接檔）

> 本檔紀錄專案進度與工作決策。任何 Agent、任何電腦：**開工先讀本檔，收工必更新本檔**。

---

## ⏯️ 上次做到哪

- **foodmap 地圖（已完成，已部署上線）**
  - 2026-08-03 上線 GitHub Pages（CI 自動部署）＋功能改版（拖曳重搜、圖釘突顯＋照片、25 類分組、收藏頁籤）
  - 2026-08-04 正式站登入開通（7 secrets、authorized domains、Google 登入成功）＋排序下拉
  - 2026-08-04 專案清理（README 重寫、移除過時規格）
  - 2026-08-06 主專案架構規劃（docs/architecture.md：單 repo＋子路徑、四圖、聚合部署）
  - 2026-08-07 foodmap 遷移子路徑（vite base `/oc_maps/foodmap/`、deploy.yml 聚合 build、根索引頁）＋ deploy run 31706973633 SUCCEEDED，`/oc_maps/` 與 `/oc_maps/foodmap/` 均 HTTP 200（HEAD be95e25）
- **parking 停車場地圖（第四圖，尚未動工）**
  - 2026-08-07 已登錄藍圖（docs/architecture.md D3、AGENTS.md 時程、資料夾結構含 `parking/`）
  - 2026-08-13 決策：**製作改期至新 session**；本 session 未跑 RDQ、未動工。新 session 開場先確認 parking 需求定義方向（跑 RDQ 訪談或照 foodmap 模式）再動工

## 🚦 目前卡在哪

- （無阻塞）parking 尚未動工，為排程決策，非技術卡關

## ➡️ 下一步

1. **開新 session 做 parking 停車場地圖**：開場先確認需求定義方向（跑 RDQ 訪談，或照 foodmap 模式），再依 docs/architecture.md D3 規格動工
2. parking 動工時**必補** `.github/workflows/deploy.yml` 的 push paths 加入 `parking/**`；`vite.config.ts` base 用 `/oc_maps/parking/`
3. parking 上線後更新根目錄 `index.html`／`README.md` 索引

## ⚠️ 注意事項（不可違反）

- **不把 API key、密碼、憑證寫進 repo**，也不要貼進本檔／AGENTS.md；一律放 `.env` 並列入 `.gitignore`
- 7 個 secrets 值來源在 `foodmap/.env.local`（gitignored，勿刪勿 commit）
- **勿改 Pages 設定為 branch 模式**：CI 用官方 `deploy-pages` action 部署
- marker icon 自訂 SVG 務必帶 `data:image/svg+xml;charset=UTF-8,` 前綴，否則退回預設圖釘
- build chunk 大小警告（587KB，firebase 所致）不影響功能
- GitHub API 直連請用 `GH_TOKEN` env（gh CLI keyring token 曾失效）；git push 走 Windows GCM 的 PAT 正常
- 純 Firebase Auth 專案（非 Identity Platform）：authorized domains／Google provider 只能控制台手動改
- 修改共用檔案前先讀最新內容；所有回應與文件使用繁體中文

## 🕐 最後更新

- 時間：2026-08-13
- 更新者：opencode @ PBHOME-X1G12
- Git push：✅已推
- Foodmap 狀態：🟢 功能完工、🟢 已部署上線
- Parking 狀態：🟡 已登記、未動工（改期至新 session）
