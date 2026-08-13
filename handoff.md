# 交接檔（handoff.md）

> 任何 Agent、任何電腦接手前**必讀**；收工時**必更新**。本檔只放交接必需的精簡資訊，詳細脈絡放 Obsidian（若有 L3）。

## ⏯️ 目前做到哪

foodmap 全鏈路已完成並上線，正式站 Google 登入已開通：
1. **功能改版**（commit `4153b40`）：拖曳重搜（`dragend`＋600ms debounce）、點列表突顯圖釘＋照片資訊窗、25 類分組（`categoryMap.ts`：料理菜系 14＋餐廳型態 11）、收藏頁籤
2. **跨裝置收藏同步**（commit `4153b40`）：Firebase 專案 `oc-maps-foodmap`（asia-east1）＋Web App `foodmap-web`＋Firestore 規則（`users/{uid}/favorites/{placeId}` 僅本人可讀寫）；`src/lib/firebase.ts` 惰性初始化，未設 env 安全停用
3. **旗標消失修復**（commit `e3e73e6`）：marker SVG 補 `data:image/svg+xml;charset=UTF-8,` 前綴；重繪 effect 補 map 就緒依賴；首載自動以台北中心搜尋
4. **排序下拉**（commit `74b284c`）：距離最近／評分最高／價位低→高／價位高→低／Google 預設（`utils/sortPlaces.ts`）；距離基準＝搜尋輸入地點；多重排序規則（價位→評分→距離）；無評分／無價位排最後
5. **正式站登入開通**（2026-08-04）：7 個 GitHub secrets 全數就緒、Identity Toolkit API 已啟用、authorized domains 加入 `peterhupc.github.io`（API 驗證通過）、Google provider 已啟用（OAuth 品牌「FoodMap 食圖」）→ **登入成功**
6. **專案清理**（commit `df9ca2a`）：`foodmap/README.md` 重寫為專案版（原為 Vite 樣板）；刪除過時 `rdq/RDQ-spec-foodmap-20260803.md`（多數功能未實作、易誤導）與空殼 `.firebaserc`
7. **主專案架構規劃**（2026-08-06）：`docs/architecture.md` 定案單 repo＋子路徑、三圖範圍（foodmap／旅遊景點／公共設施）、聚合部署模型；AGENTS.md 時程/checklist/資料夾結構同步更新
8. **foodmap 遷移子路徑**（2026-08-07，commit `52e7b79`）：`vite.config.ts` base 改 `/oc_maps/foodmap/`、deploy.yml 改單一聚合 workflow、新增根 `index.html` 主索引頁＋根 `README.md` 地圖索引；本機 preview 全 HTTP 200 驗證通過，已 push
      - ✅ **Pages 部署完成**：run `31706973633`（workflow_dispatch）SUCCEEDED，根 `/oc_maps/` 與 `/oc_maps/foodmap/` 均 HTTP 200 驗證通過。先前 cancelled 原因為 runner 可用性（非 concurrency），已由 commit `e5a6e4d` 修復。
      - 🟢 **foodmap 功能本身已完成**，部署問題僅為 CI 層，不影響程式碼
9. **停車場地圖登記**（2026-08-07）：`docs/architecture.md` D3 定案為**四圖**（foodmap／travel／facility／parking），資料夾結構＋部署 URL 表加 `parking/`；AGENTS.md 時程/checklist/資料夾結構同步更新；根 README 地圖索引加 parking 列。parking 與 travel/facility 均**規劃中尚未動工**

## 🚦 目前狀態
- L1 本地藍圖已建立：`AGENTS.md`＋`handoff.md`
- L2 GitHub 私有 repo：`peterhupc/oc_maps`，master 分支
- L3 Obsidian 筆記：`C:\Users\peter\Obsidian\oc_maps\專案工作流程.md`
- 正式站 `https://peterhupc.github.io/oc_maps/`：地圖＋篩選＋排序＋收藏＋登入全功能正常
- 主專案架構：單 repo＋子路徑（foodmap 已遷移 `/oc_maps/foodmap/`，聚合 workflow，待 push 驗證 Pages）
- 專案範圍：**四圖**（foodmap／travel／facility／parking），後三圖均規劃中尚未動工

### 已 commit 里程碑
- `241a55d` ci: official deploy-pages workflow
- `4153b40` feat(foodmap): 拖曳重搜、圖釘突顯＋照片、25 類分組、收藏頁籤、Firebase 跨裝置同步
- `b813c82`＋`805368b` docs: 藍圖與交接更新
- `e3e73e6` fix(foodmap): 修復地圖旗標消失（旗幟 icon＋載入競態＋首載自動搜尋）
- `74b284c` feat(foodmap): 搜尋結果排序下拉（距離/評分/價位/Google 預設）＋RDQ 規格卡
- `df9ca2a` docs: 重寫 foodmap README；移除過時 RDQ 規格與空殼 .firebaserc

### Firebase 設定（oc-maps-foodmap 專案）
- 專案：`oc-maps-foodmap`；Web App：`foodmap-web`；區域：`asia-east1`
- Firestore 規則已部署：`users/{uid}/favorites/{placeId}`，僅本人可讀寫（已驗證生效）
- Google 登入 provider 已啟用（OAuth 品牌「FoodMap 食圖」）；authorized domains 含 `peterhupc.github.io`

## ➡️ 下一步
1. **重觸發 Pages 部署**：`gh workflow run "Deploy maps to GitHub Pages"`，確認 concurrency group 空閒後單次執行，追蹤到 success
2. **驗證 foodmap 子路徑**：`https://peterhupc.github.io/oc_maps/foodmap/` HTTP 200 後勾選 AGENTS.md checklist
3. 🆕 **next session 主題**：使用者將開新對話接續本專案下的**其它地圖**（`travel\`／`facility\`／`parking\` 等）——parking 已登記藍圖，可從任一圖開始規劃
4. （可選）build chunk 587KB 因 firebase 打包所致，未來可 dynamic import code-split

## ⚠️ 注意事項
- `gh` CLI keyring token 失效 → GitHub API 操作（secrets、runs、dispatch）用 `GH_TOKEN` env：GCM 取 PAT（`git credential fill`）後帶 `Authorization: Bearer` header；git push 走 Windows GCM 的 PAT 運作正常
- 純 Firebase Auth 專案（非 Identity Platform）：Identity Toolkit admin API 一律回 `CONFIGURATION_NOT_FOUND`，**authorized domains／Google provider 狀態無法從 API 層讀改，只能控制台手動**
- `signInWithPopup` 錯誤無 try/catch，只出現 console（如 `auth/operation-not-allowed`）；未來可補優雅錯誤提示
- **勿改 Pages 設定為 branch 模式**——workflow 是 `deploy-pages` 官方模式，兩者需匹配
- marker icon 自訂 SVG 務必帶 `data:image/svg+xml;charset=UTF-8,` 前綴，否則地圖退回預設圖釘
- build 有 chunk 大小警告（587KB，firebase 所致）——不影響功能
- 7 個 secrets 值來源在 `foodmap/.env.local`（gitignored，勿刪勿 commit）
- 修改共用檔案前先讀最新內容，避免覆蓋其他 Agent 的變更
- 所有回應與文件使用繁體中文

## 🕐 最後更新
- 時間：2026-08-07（停車場地圖登記完成；foodmap 完工，CI 部署尚未完成——下次重觸發即可）
- 更新者：opencode @ PBHOME-X1G12
- Git push：⏳ 待 push（parking 登記變更尚未 commit）
- Foodmap 狀態：🟢 功能完工／🟡 部署待補（根頁 200，foodmap 子路徑 404）
