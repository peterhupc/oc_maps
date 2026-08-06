# oc_maps 主專案架構規劃（階段一）

> 本檔為主專案架構與資料夾分類的權威文件。2026-08-04 階段一產出。

## 1. 現況盤點

- 單 repo `peterhupc/oc_maps`（私有，master），已上線 GitHub Pages：`https://peterhupc.github.io/oc_maps/`
- 目前唯一地圖 `foodmap/`（獨立 Vite 專案）部署在 Pages **根路徑**：
  - `vite.config.ts` 的 `base` 是 `/oc_maps/`
  - `deploy.yml` 上傳 `foodmap/dist` 作為**整個 Pages artifact**
- 跨裝置收藏走 Firebase `oc-maps-foodmap`（Auth Google＋Firestore）
- 文件標準已建立：每圖 `README.md`＋`rdq/` 規格卡＋AGENTS.md 時程登錄

## 2. 架構決策（已確認）

| 決策 | 內容 |
|------|------|
| D1 倉庫模型 | **單 repo＋子路徑**：所有地圖都在 `oc_maps` 底下，各自獨立資料夾，不開多 repo |
| D2 每圖技術 | 每張地圖維持**獨立 Vite 專案**（自己的 `package.json`／`vite.config.ts`／README）；**第二張圖需求確定後再抽共用層**，不預先抽象 |
| D3 涵蓋範圍 | 目前四圖：`foodmap`（美食）、`travel`（旅遊景點）、`facility`（公共設施）、`parking`（停車場） |
| D4 文件標準 | 每圖：專案版 `README.md`＋`rdq/RDQ-spec-<圖>-<主題>-<日期>.md`＋AGENTS.md 時程/checklist 登錄；主專案根 `README.md` 做地圖索引 |

## 3. 目標資料夾結構

```
oc_maps/
├── AGENTS.md                      # 專案藍圖（跨 Agent 共用）
├── handoff.md                     # 交接檔
├── README.md                      # 主專案 README：地圖索引（每圖一行連結＋說明）
├── docs/
│   └── architecture.md            # 本檔（架構權威文件）
├── firebase.json                  # Firebase 設定（目前只有 foodmap 用 Firestore）
├── firestore.rules / firestore.indexes.json
├── rdq/                           # RDQ 需求規格卡（全部地圖共用目錄）
│   ├── RDQ-spec-foodmap-sort-20260804.md
│   └── RDQ-spec-travel-*.md / RDQ-spec-facility-*.md   # 未來
├── .github/workflows/deploy.yml   # 單一部署 workflow：聚合所有地圖 build 成一個 dist
├── foodmap/                       # 地圖一：美食地圖（現有）
├── travel/                        # 地圖二：旅遊景點地圖（規劃中，尚未動工）
├── facility/                      # 地圖三：公共設施地圖（規劃中，尚未動工）
└── parking/                       # 地圖四：停車場地圖（規劃中，尚未動工）
```

## 4. 部署模型（子路徑遷移）

### 4.1 目標

每張地圖部署在自己的子路徑下：

| 地圖 | URL |
|------|-----|
| foodmap | `https://peterhupc.github.io/oc_maps/foodmap/` |
| travel | `https://peterhupc.github.io/oc_maps/travel/` |
| facility | `https://peterhupc.github.io/oc_maps/facility/` |
| parking | `https://peterhupc.github.io/oc_maps/parking/` |
| 索引頁 | `https://peterhupc.github.io/oc_maps/` |

### 4.2 需要的改動

1. **每圖 `vite.config.ts`**：`base` 改為 `/oc_maps/<圖名>/`
   - foodmap：`base: '/oc_maps/foodmap/'`
   - 注意 `index.html` 內 favicon 等絕對路徑（`/favicon.svg`）要一併改
2. **`deploy.yml` 改為單一聚合 workflow**：
   - 觸發：`workflow_dispatch`＋paths 涵蓋所有地圖資料夾
   - 一個 job 依序 build 每張圖，把各 `dist/` 併入同一個 artifacts 目錄：
     - `foodmap/dist` → `dist/foodmap/`
     - （未來）`travel/dist` → `dist/travel/`
   - 最後一次 `upload-pages-artifact` 上傳整個 `dist/`
3. **主專案索引頁**：根 `dist/` 放一個簡易 `index.html`（地圖索引），可為靜態檔或小 Vite 專案

### 4.3 為何必須單一 workflow（重要）

現有 deploy.yml 用 `concurrency: group: pages, cancel-in-progress: true`。
若每張地圖各自開一個 workflow，後觸發的會**取消前一個正在跑或剛跑完**的 Pages 部署，
導致 artifact 互相覆蓋。因此多圖部署必須走**單一 workflow 聚合**。

## 5. 每張地圖的生命週期標準流程

1. **RDQ 訪談** → 產出 `rdq/RDQ-spec-<圖>-<主題>-<日期>.md` 規格卡，使用者確認後才動工
2. **初始化**：複製 `foodmap/` 專案骨架（Vite＋TS），改 `index.html` title/lang、`vite.config.ts` base、README
3. **開發**：獨立 `package.json`／`src/`；沿用現有 pattern（`lib/`、`hooks/`、`utils/`、`components/`）
4. **上線**：改 deploy.yml 聚合 build＋時程登錄 AGENTS.md＋checklist 打勾
5. **共用層抽取**：等第二張圖動工、需求確定後，才把真的重複的 code 抽到根目錄共用（例如 Firebase 惰性初始化、fetch cache），**現在不抽**

## 6. 共用層（未來，時機未到）

已知潛在共用候選（僅記錄，不動工）：
- Firebase 惰性初始化（`lib/firebase.ts` 模式）
- Google Maps JS API loader＋cache（`services/mapsLoader.ts`、`services/cache.ts`）
- 排序/分類 utils

抽取原則：**至少兩張圖用到且驗證過，才抽**；抽完放 `src/` 或 `shared/`（待定）。

## 7. 遷移執行清單（foodmap → 子路徑）

- [ ] `foodmap/vite.config.ts` base → `/oc_maps/foodmap/`
- [ ] `foodmap/index.html` 絕對路徑（favicon 等）改用相對路徑或 `/oc_maps/foodmap/...`
- [ ] 改 `deploy.yml` 為聚合 build（見 §4.2）
- [ ] 建主專案索引頁 `index.html`
- [ ] 主專案根 `README.md` 地圖索引
- [ ] 本機 `npm run build`＋`preview` 驗證子路徑可開
- [ ] commit＋push，確認 Pages 部署成功且 `/oc_maps/foodmap/` 可開
- [ ] 更新 AGENTS.md 資料夾結構＋handoff.md
