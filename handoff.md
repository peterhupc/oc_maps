# 交接檔（handoff.md）

> 任何 Agent、任何電腦接手前**必讀**；收工時**必更新**。本檔只放交接必需的精簡資訊，詳細脈絡放 Obsidian（若有 L3）。

## ⏯️ 目前做到哪
foodmap 三大問題＋跨裝置同步＋旗標修復，全數實作並已上線：
1. **地圖拖曳**：`dragend` 取代 `center_changed`（消除回圈），拖動後 600ms debounce 自動重搜
2. **點列表→地圖突顯**：點選列表店名，地圖 panTo 該店並開資訊窗；選中圖釘變藍（`PIN_ICON_ACTIVE`）；資訊窗含照片＋評分＋價位＋營業狀態
3. **分類 25 項分組**：`categoryMap.ts` 重寫（料理菜系 14＋餐廳型態 11），FilterPanel 用 `<details>` 兩組摺疊；`foodSource.ts` 改關鍵字查詢，上限 `MAX_KEYWORD_QUERIES=8`，超過退回預設關鍵字（避免爆 API 額度）
4. **收藏清單**：PlaceList 新增「全部／收藏」頁籤；`useFavorites` 改存完整店家快照（含 `savedAt`）
5. **跨裝置收藏同步**：Firebase 專案 `oc-maps-foodmap`（asia-east1）＋Web App `foodmap-web`＋Firestore 規則（`users/{uid}/favorites/{placeId}` 僅本人可讀寫）已部署；`src/lib/firebase.ts` 惰性初始化，未設 env 時安全停用；登入後合併本機＋雲端收藏
6. **地圖旗標消失修復**（commit `e3e73e6`）：自訂 marker icon 補上 `data:image/svg+xml;charset=UTF-8,` 前綴（否則 Google Maps 視為無效 URL 退回預設圖釘）；重繪 effect 增加 map 就緒依賴（修 maps 載入競態）；App 首載 maps 就緒後自動以台北中心搜尋一次（原本載入時 places 為空，地圖無旗標）；旗幟設計＝白底橘旗／選中藍底白旗

## 🚦 目前狀態
- L1 本地藍圖已建立：`AGENTS.md`＋`handoff.md`
- L2 GitHub 私有 repo：`peterhupc/oc_maps`，master 分支（HEAD `e3e73e6`，已 push）
- L3 Obsidian 筆記：`C:\Users\peter\Obsidian\oc_maps\專案工作流程.md`

### 已 commit 里程碑
- `241a55d` ci: official deploy-pages workflow
- `4153b40` feat(foodmap): 拖曳重搜、圖釘突顯＋照片、25 類分組、收藏頁籤、Firebase 跨裝置同步
- `b813c82`＋`805368b` docs: 藍圖與交接更新
- `e3e73e6` fix(foodmap): 修復地圖旗標消失（旗幟 icon＋載入競態＋首載自動搜尋）

### Firebase 設定（oc-maps-foodmap 專案）
- 專案：`oc-maps-foodmap`；Web App：`foodmap-web`；區域：`asia-east1`
- Firestore 規則已部署：`users/{uid}/favorites/{placeId}`，`allow read, write: if request.auth != null && request.auth.uid == userId`
- Google 登入 provider 已啟用（OAuth 品牌「FoodMap 食圖」）；firestore.rules 已驗證生效

## ➡️ 下一步
1. **使用者手動（開通正式站登入）**：
   - GitHub 後台新增 Actions secrets：`VITE_FIREBASE_API_KEY`、`VITE_FIREBASE_AUTH_DOMAIN`、`VITE_FIREBASE_PROJECT_ID`、`VITE_FIREBASE_APP_ID`、`VITE_FIREBASE_STORAGE_BUCKET`、`VITE_FIREBASE_MESSAGING_SENDER_ID`（值在 `foodmap/.env.local`；新增後 re-run 最新 workflow 即可熱更新）
   - Firebase 控制台 > Authentication > Settings > Authorized domains 加入 `peterhupc.github.io`（否則正式站 Google 登入 popup 會被擋；localhost 不需加）
   - 目前正式站功能正常（地圖＋旗標＋收藏本機），僅「登入／跨裝置同步」因 secrets 未加而停用（安全降級）
2. 規劃主專案架構與資料夾分類（區域地圖 → 分支）

## ⚠️ 注意事項
- `gh` CLI 的 keyring token 仍失效（`gh auth login -h github.com` 可修），但 git push 走 Windows GCM 的 PAT，目前運作正常
- GitHub API 操作（設 secret、看 runs、觸發 dispatch）用 GCM PAT：`git credential fill` 取出後帶 `Authorization: Bearer` header
- **勿改 Pages 設定為 branch 模式**——workflow 是 `deploy-pages` 官方模式，兩者需匹配
- `package-lock.json` 曾修過 `@rolldown/binding-android-arm64` 缺 version（Windows 產生 lockfile 的 bug）；本次新增 firebase 相依已更新 lockfile，注意此 entry
- `firebase.json` 的 auth providers 區塊已移除（OAuth 品牌在控制台設，firebase.json 不需重複）；該檔僅含 firestore 規則設定
- build 有 chunk 大小警告（587KB，firebase 打包所致）——不影響功能，未來可做 dynamic import code-split
- marker icon 若再自訂 SVG，務必帶 `data:image/svg+xml;charset=UTF-8,` 前綴，否則地圖不顯示自訂圖樣
- 修改共用檔案前先讀最新內容，避免覆蓋其他 Agent 的變更
- 所有回應與文件使用繁體中文

## 🕐 最後更新
- 時間：2026-08-03（旗標修復上線）
- 更新者：opencode @ PBHOME-X1G12
- Git push：✅ 已推（peterhupc/oc_maps，master，至 e3e73e6）
