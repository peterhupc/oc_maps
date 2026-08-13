# 停車即時 ParkingMap

以 Google Maps 為基圖的停車場搜尋地圖（北台三都：臺北／新北／桃園）。Google Places 提供點位，政府開放資料提供即時剩餘車位。

正式站（GitHub Pages）：<https://peterhupc.github.io/oc_maps/parking/>

## 功能

- 地址搜尋 + 拖曳地圖重搜（拖動後自動更新搜尋範圍）
- 半徑、停車場類型分類、開放中開關等篩選
- 即時剩餘車位：政府開放資料（臺北市停管處 blob、新北市資料開放平台、桃園開放資料）每 15 分鐘由 GitHub Actions 定時抓取，靜態檔部署（見 `scripts/fetch-availability.mjs`）
- 結果排序下拉：距離最近／剩餘車位最多／預設（見 `src/utils/sortPlaces.ts`）
- 點選列表項目突顯圖釘並顯示車位資訊窗（剩餘車位、收費、開放時間）
- 收藏：本機儲存 + Google 登入後跨裝置 Firebase 同步（沿用 oc-maps-foodmap 專案，collection 為 `users/{uid}/parking_favorites`）

## 資料源

| 縣市 | 靜態（名稱/座標/收費） | 即時（剩餘車位） | 座標 |
|------|----------------------|-----------------|------|
| 臺北市 | `TCMSV_alldesc.json` | `TCMSV_allavailable.json` | TWD97（腳本內轉 WGS84） |
| 新北市 | data.ntpc.gov.tw 路外公共停車場資訊 | data.ntpc.gov.tw 即時剩餘車位 | TWD97（腳本內轉 WGS84） |
| 桃園市 | opendata.tycg.gov.tw（單一來源含即時） | 同左 | WGS84 |

即時資料檔：`public/data/availability.json`（`npm run fetch:availability` 產生）。前端依「名稱相似＋距離 < 300m」模糊比對接上 Google Places 點位；比對不到僅顯示 Google 基本資訊。

## 開發指令

```bash
npm install        # 安裝相依套件
npm run dev        # 本地開發（Vite dev server）
npm run fetch:availability   # 抓取三都即時車位，產出 public/data/availability.json
npm run build      # 型別檢查 + 正式建置（輸出 dist/）
npm run preview    # 預覽正式建置結果
npm run lint       # oxlint 檢查
```

## 環境變數

複製 `.env.example` 為 `.env.local` 並填入：

| 變數 | 用途 |
|------|------|
| `VITE_GMAPS_KEY` | Google Maps JavaScript API + Places API 金鑰 |
| `VITE_FIREBASE_API_KEY` | Firebase Web 專案 API key（沿用 oc-maps-foodmap） |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase 專案 ID |
| `VITE_FIREBASE_APP_ID` | Firebase Web app ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging sender ID |

`.env.local` 已被 `.gitignore` 排除，不會進 repo；未設定 Firebase 變數時收藏僅存本機，登入功能安全停用。

## 部署

- 主部署：GitHub Actions（`.github/workflows/deploy.yml`），push `parking/**` 時先抓取即時車位再 build 並聚合部署。7 個 Firebase／Maps secrets 透過 GitHub repository secrets 注入。
- 定時更新：`.github/workflows/parking-update.yml` 每 15 分鐘抓取即時車位，資料有變化才 commit（連動觸發主部署）。

## 目錄結構

```
parking/
├── scripts/fetch-availability.mjs   # 三都抓取 + TWD97→WGS84 + 正規化
├── public/data/availability.json    # 產出的即時車位檔（靜態部署）
└── src/
    ├── components/    # UI（地圖、列表、篩選、搜尋列）
    ├── hooks/         # 收藏、搜尋、JS API 載入
    ├── lib/           # Firebase 惰性初始化
    ├── services/      # 資料層（parkingSource、availability、geocode、cache、mapsLoader）
    ├── types/         # ParkingPlace 等型別
    └── utils/         # 停車場類型分組、排序
```