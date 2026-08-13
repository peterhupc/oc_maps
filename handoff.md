# handoff（交接檔）

> 本檔紀錄專案進度與工作決策。任何 Agent、任何電腦：**開工先讀本檔，收工必更新本檔**。

---

## ⏯️ 上次做到哪

- **parking 停車場地圖（第四圖）已上線**
  - 2026-08-14 RDQ 訪談完成、規格 confirmed（`rdq/RDQ-spec-parking-20260814.md`）：分階段交付，第一階段北台三都（台北/新北/桃園）
  - 首版 commit `f0d2b59`：三都抓取腳本（TWD97→WGS84）＋全 UI＋deploy.yml 聚合＋parking-update 定時 workflow；正式站 https://peterhupc.github.io/oc_maps/parking/ 已上線（CI run 31729457755 success，index 與 availability.json 均 HTTP 200，3428 筆）
  - 收藏定位 commit `e77a72a`：點收藏停車場→地圖定位＋臨時圖釘＋資訊窗（CI run 31731052735 success）
  - 資料源：台北 `TCMSV_alldesc/available`（join by id，TWD97）；新北 `data.ntpc.gov.tw` dataset `b1464ef0-9c7c-4a6f-abf7-6bdf32847e68`（靜態，page/size 翻頁）＋`e09b35a5-a738-48cc-b0f5-570b67ad9c78`（動態）；桃園 `opendata.tycg.gov.tw` resource 0381e141-f7ee-450e-99da-2240208d1773（wgsY=經度/wgsX=緯度）
  - `parking/public/data/availability.json` 3428 筆（台北 1749/新北 1433/桃園 246），有即時車位 1720 筆

- **foodmap 地圖（已完成，已部署上線）**
  - 2026-08-03 上線＋功能改版；08-04 登入開通＋排序下拉＋專案清理；08-06 主專案架構規劃；08-07 遷移子路徑（`/oc_maps/foodmap/`，run 31706973633 SUCCEEDED）

## 🚦 目前卡在哪

- （無阻塞）parking 首版已上線、收藏定位已完工；待使用者實際使用驗證

## ➡️ 下一步

1. **使用驗證**：開 https://peterhupc.github.io/oc_maps/parking/ 實際搜尋（三都任一），確認搜尋/拖曳重搜/分類/即時車位 join/收藏同步/收藏定位都正常
2. **確認 parking-update workflow 定時跑**：`gh run list` 看每 15 分 cron 是否成功、availability.json 是否持續更新
3. 第一階段驗收通過後，第二階段擴充台中/台南/高雄（更新 fetch 腳本＋availability 前端 join）
4. 後續地圖：travel（地圖二）、facility（地圖三）規劃中尚未動工

## ⚠️ 注意事項（不可違反）

- **不把 API key、密碼、憑證寫進 repo**，也不要貼進本檔／AGENTS.md；一律放 `.env` 並列入 `.gitignore`
- 7 個 secrets 值來源在 `foodmap/.env.local`（gitignored，勿刪勿 commit）；parking build 依賴 repo 的 7 secrets 注入
- **勿改 Pages 設定為 branch 模式**：CI 用官方 `deploy-pages` action 部署
- marker icon 自訂 SVG 務必帶 `data:image/svg+xml;charset=UTF-8,` 前綴，否則退回預設圖釘
- build chunk 大小警告（firebase 所致，~538KB）不影響功能
- GitHub API 直連請用 `GH_TOKEN` env（gh CLI keyring token 曾失效）；git push 走 Windows GCM 的 PAT 正常
- 純 Firebase Auth 專案（非 Identity Platform）：authorized domains／Google provider 只能控制台手動改
- parking 收藏用 Firebase 專案 oc-maps-foodmap 的 `users/{uid}/parking_favorites`（collection 不同，與 foodmap 收藏互不干擾）；localStorage KEY `parking_favorites`
- 修改共用檔案前先讀最新內容；所有回應與文件使用繁體中文

## 🕐 最後更新

- 時間：2026-08-14
- 更新者：opencode @ PBHOME-X1G12
- Git push：✅ 已推（f0d2b59 首版＋e77a72a 收藏定位，本次 handoff/AGENTS 更新待推）
- Foodmap 狀態：🟢 功能完工、🟢 已部署上線
- Parking 狀態：🟢 首版已上線、🟢 收藏定位完工