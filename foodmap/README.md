# FoodMap 食圖

以 Google Maps 為基圖的美食搜尋地圖。輸入區域後依分類、星等、人均、營業狀態篩選餐廳，並支援收藏與跨裝置同步。

正式站（GitHub Pages）：<https://peterhupc.github.io/oc_maps/>

## 功能

- 地址搜尋 + 拖曳地圖重搜（拖動後自動更新搜尋範圍）
- 半徑、分類、星等下限、價位區間、營業中開關等篩選
- 25 類分組（料理菜系＋餐廳型態，見 `src/utils/categoryMap.ts`）
- 結果列表排序下拉：距離最近／評分最高／價位高低／Google 預設（見 `src/utils/sortPlaces.ts`）
- 點選列表項目突顯圖釘並顯示照片與店家資訊窗
- 收藏：本機儲存 + Google 登入後跨裝置 Firebase 同步（見 `src/hooks/useFavorites.ts`）

## 開發指令

```bash
npm install        # 安裝相依套件
npm run dev        # 本地開發（Vite dev server）
npm run build      # 型別檢查 + 正式建置（輸出 dist/）
npm run preview    # 預覽正式建置結果
npm run lint       # oxlint 檢查
```

## 環境變數

複製 `.env.example` 為 `.env.local` 並填入：

| 變數 | 用途 |
|------|------|
| `VITE_GMAPS_KEY` | Google Maps JavaScript API + Places API 金鑰 |
| `VITE_FIREBASE_API_KEY` | Firebase Web 專案 API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase 專案 ID |
| `VITE_FIREBASE_APP_ID` | Firebase Web app ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging sender ID |

`.env.local` 已被 `.gitignore` 排除，不會進 repo；未設定 Firebase 變數時收藏僅存本機，登入功能安全停用。

## 部署

由 GitHub Actions（`.github/workflows/deploy.yml`）自動部署至 GitHub Pages。觸發方式：push `foodmap/**` 或 `workflow_dispatch`。7 個 Firebase／Maps secrets 透過 GitHub repository secrets 注入，不會寫入 repo。

## 目錄結構

```
foodmap/src/
├── components/    # UI（地圖、列表、篩選、搜尋列）
├── hooks/         # 收藏、搜尋、JS API 載入
├── lib/           # Firebase 惰性初始化
├── locales/       # i18next 語系檔（zh-TW）
├── services/      # 資料層（foodSource、geocode、cache、mapsLoader）
├── types/         # FoodPlace 等型別
└── utils/         # 25 類分組、排序
```

