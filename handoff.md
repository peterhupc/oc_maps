# handoff（交接檔）

> 本檔紀錄專案進度與工作決策。任何 Agent、任何電腦：**開工先讀本檔，收工必更新本檔**。

---

## ⏯️ 上次做到哪

- **foodmap 收藏功能補強**（2026-08-14，三個 commit 已上線）
  - `4cc9f56` fix：**點收藏餐廳→地圖定位＋突顯**。改用與 parking 相同的 `selectedPlace` 寫法（App 同時存 selectedId＋selectedPlace；MapView 依 selectedPlace 直接 panTo，不在搜尋結果時建臨時旗標＋資訊窗）。此舉同時**取代**先前 `a537d77` 意外夾帶的 `pinnedPlaces` 作法（該功能現已用正式寫法實作）
  - `b80e7b9` fix：收藏縮圖照片 URL 過期（Google `photo_reference` 會過期）導致破圖 → 載入失敗退回「無照片」佔位、資訊窗破圖自動隱藏
  - `3d61efd` feat：縮圖過期時**自動向 Places API 重新抓取最新照片 URL** 並更新收藏（localStorage＋Firebase）。流程：破圖 onError → `refreshPlacePhotos()`（foodSource）→ `updateFavorite()`（useFavorites）→ 新 URL 重載；同餐廳每 session 只刷新一次
  - 部署：CI run `31732785609`（4cc9f56）success；`/oc_maps/foodmap/` HTTP 200

- **parking 停車場地圖（第四圖）已上線**
  - 首版 `f0d2b59`：三都抓取腳本（TWD97→WGS84）＋全 UI＋deploy.yml 聚合＋parking-update 定時 workflow；`/oc_maps/parking/` 已上線（3428 筆）
  - 收藏定位 `e77a72a`：點收藏停車場→地圖定位＋臨時圖釘＋資訊窗

## 🚦 目前卡在哪

- （無阻塞）foodmap 收藏定位＋縮圖刷新已上線、parking 已上線；待使用者實際使用驗證

## ➡️ 下一步

1. **使用驗證 foodmap**：開 https://peterhupc.github.io/oc_maps/foodmap/ → 收藏頁籤點收藏餐廳確認地圖定位；縮圖若為舊收藏，確認能自動刷新成新照片
2. **使用驗證 parking**：開 https://peterhupc.github.io/oc_maps/parking/ 實際搜尋（三都任一），確認即時車位 join／收藏同步／收藏定位正常；`gh run list` 確認 parking-update cron 每 15 分跑成功
3. parking 第一階段驗收後擴充台中/台南/高雄（更新 fetch 腳本＋前端 join）
4. 後續地圖：travel（地圖二）、facility（地圖三）規劃中尚未動工

## ⚠️ 注意事項（不可違反）

- **不把 API key、密碼、憑證寫進 repo**，也不要貼進本檔／AGENTS.md；一律放 `.env` 並列入 `.gitignore`
- 7 個 secrets 值來源在 `foodmap/.env.local`（gitignored，勿刪勿 commit）；parking build 依賴 repo 的 7 secrets 注入
- **勿改 Pages 設定為 branch 模式**：CI 用官方 `deploy-pages` action 部署
- marker icon 自訂 SVG 務必帶 `data:image/svg+xml;charset=UTF-8,` 前綴，否則退回預設圖釘
- Google 照片 URL 的 `photo_reference` **會過期**：收藏縮圖破圖是正常現象，靠 `refreshPlacePhotos` 自動刷新（勿手動改收藏資料）
- build chunk 大小警告（firebase 所致，~590KB）不影響功能
- GitHub API 直連請用 `GH_TOKEN` env（gh CLI keyring token 曾失效）；git push 走 Windows GCM 的 PAT 正常
- 純 Firebase Auth 專案（非 Identity Platform）：authorized domains／Google provider 只能控制台手動改
- parking 收藏用 Firebase 專案 oc-maps-foodmap 的 `users/{uid}/parking_favorites`（collection 不同，與 foodmap 收藏互不干擾）；localStorage KEY `parking_favorites`
- 修改共用檔案前先讀最新內容；所有回應與文件使用繁體中文

## 🕐 最後更新

- 時間：2026-08-14
- 更新者：opencode @ PBHOME-X1G12
- Git push：✅ 已推（4cc9f56 收藏定位、b80e7b9 縮圖佔位、3d61efd 縮圖自動刷新）
- 本次收工同步：AGENTS.md＋handoff.md 更新（待 commit＋push）
- Foodmap 狀態：🟢 功能完工、🟢 收藏定位完工、🟢 縮圖自動刷新完工、🟢 已部署上線
- Parking 狀態：🟢 首版已上線、🟢 收藏定位完工