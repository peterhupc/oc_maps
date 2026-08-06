# oc_maps

各種與地圖相關的專案集合。每張地圖是一個獨立子專案，共用同一 repo、同一 GitHub Pages 部署管道。

## 地圖索引

| 地圖 | 網址 | 狀態 | 說明 |
|------|------|------|------|
| 食圖 FoodMap | https://peterhupc.github.io/oc_maps/foodmap/ | 已上線 | 美食搜尋、25 類分組、收藏（跨裝置 Firebase 同步）、排序 |

## 架構

- 單 repo＋子路徑：每張地圖一個資料夾、一個獨立 Vite 專案
- 聚合部署：單一 CI workflow 依序 build 各圖，聚合到一個 `dist/` 後發布到 GitHub Pages
- 詳見 [docs/architecture.md](docs/architecture.md)

## 開發

每張地圖資料夾內有各自的 README，含功能、開發指令與 env 對照（例如 [foodmap/README.md](foodmap/README.md)）。

跨 Agent 工作約定與進度追蹤：`AGENTS.md`＋`handoff.md`。
