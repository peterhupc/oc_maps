# oc_maps（專案藍圖）

> 本檔為跨 Agent 通用的專案藍圖（AGENTS.md 開放標準）。任何 Agent 的每個 session 都應先讀本檔＋`handoff.md`。

## 專案簡介
主專案做各種跟地圖有關的項目，各個區域功能地圖為附屬此主專案的分支。

## 關鍵時程
<!-- 格式：- 事件名稱：日期（說明）；沒有就留白 -->
- foodmap 上線 GitHub Pages：2026-08-03（CI 自動部署 + API key secret 就緒）
- foodmap 功能改版：2026-08-03（拖曳重搜、圖釘突顯＋照片、25 類分組、收藏頁籤、跨裝置 Firebase 同步）
- 正式站登入開通：2026-08-04（7 secrets 補齊、authorized domains、Google 登入成功）
- foodmap 排序下拉：2026-08-04（距離／評分／價位／Google 預設）
- 專案清理：2026-08-04（README 重寫、移除過時 RDQ 規格與空殼 .firebaserc）
- 主專案架構規劃：2026-08-06（docs/architecture.md：單 repo＋子路徑、三圖範圍、聚合部署模型）
- foodmap 遷移子路徑：2026-08-07（vite base `/oc_maps/foodmap/`、deploy.yml 聚合 build、主專案索引頁＋根 README；本機 preview HTTP 全 200 驗證通過）
- 停車場地圖登記：2026-08-07（第四圖 parking 登錄藍圖，規劃中尚未動工；travel/facility/parking 範圍定案為四圖）
- 停車場地圖改期：2026-08-13（parking 藍圖已登錄、未跑 RDQ 未動工；實際製作改至新 session，本次收工僅補記並 commit＋push）

## 目標與路線圖
<!-- 用 checklist 追蹤，收工技能會更新這裡 -->
- [x] foodmap 分支：CI 部署 GitHub Pages 上線（https://peterhupc.github.io/oc_maps/）
- [x] foodmap 三問題改版：拖曳＋拖動重搜、點列表突顯地圖＋照片資訊窗、25 類分組、收藏清單頁籤
- [x] 跨裝置收藏同步：Firebase 專案 oc-maps-foodmap（Auth Google＋Firestore 規則已部署、SDK 已接）
- [x] 正式站登入開通：7 個 GitHub secrets 補齊、authorized domains 加入 peterhupc.github.io、Google 登入驗證成功
- [x] foodmap 排序下拉：距離／評分／價位／Google 預設（commit 74b284c）
- [x] 本機驗證後 commit＋push（foodmap 改版＋Firebase＋workflow）
- [x] 專案清理：README 重寫、刪過時 RDQ 規格與空殼 .firebaserc（commit df9ca2a）
- [x] 階段一：規劃主專案架構與資料夾分類（單 repo＋子路徑、三圖範圍、聚合部署；docs/architecture.md）
- [x] 階段一後續：foodmap 遷移子路徑（vite base、deploy.yml 聚合 build、主專案索引頁）
- [x] 遷移後 commit＋push，驗證 Pages `/oc_maps/foodmap/` 與 `/oc_maps/` 可開（run 31706973633 SUCCEEDED，兩 URL 均 HTTP 200）
- [x] 停車場地圖登記：parking 登錄藍圖（docs/architecture.md D3＋資料夾結構、AGENTS.md 時程；規劃中尚未動工）
- [ ] 階段二：
- [ ] 階段三：

## 資料夾結構
<!-- 初始化時自動掃描生成，之後新增檔案要更新 -->
```
oc_maps/
├── AGENTS.md                      # 專案藍圖（本檔）
├── handoff.md                     # 交接檔
├── README.md                      # 主專案地圖索引（四圖一覽）
├── index.html                     # 主專案索引頁（聚合後為 dist/index.html）
├── firebase.json                  # Firebase 設定（firestore 規則/indexes 路徑）
├── firestore.rules                # Firestore 安全規則（收藏僅本人可讀寫）
├── .github/workflows/deploy.yml   # 單一聚合部署 workflow（依序 build 各圖→聚合 dist/→deploy-pages）
├── .gitignore
├── docs/
│   └── architecture.md            # 主專案架構規劃（單 repo＋子路徑、四圖、聚合部署）
├── rdq/                           # RDQ 需求規格卡（保留最新排序規格，舊卡已刪）
│   └── RDQ-spec-foodmap-sort-20260804.md
└── foodmap/                       # foodmap 區域地圖分支（獨立 Vite 專案）
    ├── README.md                  # 專案版 README（功能／開發指令／env 對照／部署）
    ├── src/                       # mapsLoader、foodSource、components、hooks、utils、lib
    │   ├── lib/firebase.ts        # Firebase 惰性初始化（未設 env 時安全停用）
    │   ├── hooks/useFavorites.ts  # 收藏（本機＋Firebase 合併同步）
    │   ├── utils/categoryMap.ts   # 25 類分組（料理菜系＋餐廳型態）
    │   └── utils/sortPlaces.ts    # 結果排序（距離／評分／價位／Google 預設）
    └── .env.local                 # 本機測試用 API key＋Firebase 設定（gitignored，不入 repo）
├── travel/                        # 地圖二：旅遊景點地圖（規劃中，尚未動工）
├── facility/                      # 地圖三：公共設施地圖（規劃中，尚未動工）
└── parking/                       # 地圖四：停車場地圖（規劃中，尚未動工）
```

## 同步層級（本專案初始化至第 3 層級）

| 層級 | 平台 | 位置 | 讀取時機 |
|------|------|------|---------|
| L1 | 本地（雲端硬碟資料夾） | `AGENTS.md`＋`handoff.md` | 每個 session |
| L2 | GitHub | [peterhupc/oc_maps](https://github.com/peterhupc/oc_maps)（私有） | 指定時 |
| L3 | Obsidian | Obsidian 根目錄/oc_maps（獨立 vault）/專案工作流程.md | 有需要時 |

## 工作約定
- 任何 Agent、任何電腦：**開工先讀 `handoff.md`，收工必更新 `handoff.md`**
- 修改共用檔案前先讀最新內容，避免覆蓋其他 Agent 的變更
- 所有回應與文件使用繁體中文
- 修改前先確認計畫，優先保留原有資料結構

## 安全與隱私（不可違反）
- **不把 API key、密碼、憑證寫進 repo**，也不要貼進 `AGENTS.md`／`handoff.md`；一律放 `.env` 並列入 `.gitignore`
- **學生資料只用座號**，不出現姓名、學號、班級以外的個資、照片或聯絡方式
- 要公開分享前，先確認檔案裡沒有上述兩類內容
