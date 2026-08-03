# RDQ 需求規格卡：Google Maps 美食地圖（食圖）

> 專案代號：`foodmap`｜建立日期：2026-08-03｜**status：confirmed**（2026-08-03 使用者確認）

---

## 1. 一句話願景
以 **Google Maps 為基圖**，輸入特定區域（如桃園藝文特區），在 **1–10 公里** 範圍內搜尋美食，並以 **分類、星等、人均消費、營業時間、部落客推薦（近一年）** 為篩選條件呈現。

---

## 2. 使用者與使用場景（Persona / JTBD）
| 編號 | Persona | 關鍵任務 |
|------|---------|----------|
| U1 | 週末想找新餐廳的上班族 | 「桃園藝文特區附近 3 公里，日式、人均 300–500，4.5 星以上，現在營業中」 |
| U2 | 深度美食探索者 | 「看部落客近一年推薦的南美燒烤，直接導航過去」 |
| U3 | 自己維護清單的重度用戶 | 「把常去的店標記、匯出 CSV 備份」 |

---

## 3. 功能需求（MoSCoW）
| 優先度 | ID | 功能描述 | 驗收條件 |
|--------|----|----------|----------|
| **Must** | F1 | Google Maps 基圖 + 區域中心點輸入（地址 / 座標 / 地標搜尋） | 可在網頁上看到地圖、輸入框、搜尋按鈕 |
| **Must** | F2 | 半徑滑桿 1–10 km 即時過濾標記 | 移動滑桿瞬間重繪標記 |
| **Must** | F3 | 美食分類多選（街邊小吃、高檔餐廳、日式、韓式、南美燒烤等） | 分類對照 Google Places type，勾選即過濾 |
| **Must** | F4 | 星等下限（0.5 星階）、人均區間、營業中開關 | 四個條件 AND 關係篩選 |
| **Must** | F5 | **部落客推薦層**（近 1 年文章）→ 點擊顯示摘要、連結原文 | 後端爬蟲每日/每週更新，前端只讀快取 |
| **Should** | F6 | 店家資訊側欄：照片、評論精華、導航按鈕 | 點標記 → 右側滑出詳細卡片 |
| **Should** | F7 | 個人收藏（LocalStorage）→ 匯出 JSON / CSV | 無後端帳號，瀏覽器端完成 |
| **Could** | F8 | 深色模式、行動版響應式 | CSS media query 完成 |
| **Won’t** | — | 即時排隊、訂位、外送整合 | 明確不做 |

---

## 4. 非功能需求
| 類別 | 指標 |
|------|------|
| 效能 | 首屏 < 3s、地圖互動 60fps、搜尋回應 < 1s（快取命中） |
| 成本 | **完全免費**：Google Maps JS API + Places API 僅用每月 $200 免費額度；超額自動停用搜尋並提示 |
| 安全 | API Key 只放 `.env` + `.gitignore`，**私有 repo**；前端不直露 Key（必要時走 Netlify/Cloudflare Functions 代理） |
| 可維護 | **資料層與畫面層分離**；內部介面 `FoodSource.fetch(area, radius, filters)` → 回傳統一 JSON，未來可換 Mapbox/OSM |
| 部署 | 靜態網站 → GitHub Pages / Netlify / Vercel（個人版先跑） |

---

## 5. 技術棧（確認）
| 層級 | 選項 | 備註 |
|------|------|------|
| 前端 | **React 18 + Vite + TypeScript** | 官方 `@googlemaps/react-wrapper`、生態成熟、長期維護成本最低 |
| 地圖 | `@googlemaps/js-api-loader` + `@googlemaps/react-wrapper` + Places Library | 官方 loader + React wrapper，支援樹搖 |
| 爬蟲 | **GitHub Actions 定時跑**（Node + cheerio / puppeteer） | 產生 `data/bloggers.json` 靜態檔，前端直讀 |
| 部署 | GitHub Pages（私有 repo → Actions deploy） | 免費、自動 HTTPS |
| 型別 | TypeScript（介面優先） | `FoodPlace`, `BloggerPost`, `FilterState` 先定型別 |
| 國際化 | **i18next**（專案初始化即裝） | 僅含 `zh-TW.json`，鍵值用英文，未來加語系只增檔 |

---

## 6. 資料模型（核心介面）
```ts
interface FoodPlace {
  place_id: string;
  name: string;
  location: { lat: number; lng: number };
  types: string[];                  // Google Places types
  rating: number;                   // 0–5
  user_ratings_total: number;
  price_level?: 0 | 1 | 2 | 3 | 4;  // Google 定義
  opening_hours?: { open_now: boolean; weekday_text: string[] };
  photos?: string[];                // photo_reference → URL
  blogger_refs?: BloggerRef[];      // 關聯部落客文章
}

interface BloggerRef {
  title: string;
  url: string;
  source: 'ptt' | 'pixnet' | 'ifoodie' | 'custom';
  published_at: string;             // ISO 8601
  excerpt: string;                  // 前 200 字
  image_url?: string;               // og:image 或文章首圖（MVP 零成本圖片來源）
}
```

---

## 7. 美食分類對照表（初版，可擴充）
| 使用者分類 | Google Places type(s) | 備註 |
|------------|-----------------------|------|
| 街邊小吃 | `food`, `meal_takeaway`, `street_food` (自訂) |  |
| 高檔餐廳 | `restaurant`, `fine_dining` (自訂) | 配合 price_level ≥ 3 |
| 日式 | `japanese_restaurant`, `sushi_restaurant`, `ramen_restaurant` |  |
| 韓式 | `korean_restaurant` |  |
| 南美燒烤 | `brazilian_restaurant`, `argentine_restaurant`, `barbecue_restaurant` |  |
| 咖啡輕食 | `cafe`, `bakery`, `dessert` |  |
| 素食 | `vegan_restaurant`, `vegetarian_restaurant` |  |

---

## 8. API 呼叫策略（免費額度內）
| 呼叫類型 | 快取策略 | 預估日用量（100 DAU） |
|----------|----------|----------------------|
| Places Nearby Search | **前端 5 分鐘快取**（同中心點+半徑+關鍵字） | ~200 次/日 |
| Place Details（照片、營業時間） | **按需、單店快取 1 天** | ~500 次/日 |
| Geocoding（地址→座標） | **瀏覽器自帶快取** | ~50 次/日 |
| **合計** |  | **< 750 次/日** ≪ $200 額度 |

> 超額保護：前端攔截 `OVER_QUERY_LIMIT` → 顯示「今日免費額度用盡，請明天再來」。

---

## 9. 部落客爬蟲規格（確認）
| 來源 | 爬取頻率 | 選文條件 | 輸出 | 優先度 |
|------|----------|----------|------|--------|
| **痞客邦 (Pixnet)** | 每日 03:00 | 標題含店名＋發文 ≤ 1 年 | `bloggers.json` | **MVP 必做** |
| **PTT Food 版** | 每日 03:15 | 推文含店名＋發文 ≤ 1 年 | 合併同檔 | **MVP 必做**（關鍵字補強） |
| **愛食記 (iFoodie)** | 每日 03:30 | 標題含店名＋發文 ≤ 1 年 | 合併同檔 | **MVP 納入**（需 Puppeteer 繞過反爬蟲） |
| 自訂 RSS | 依來源 | 同上 | 合併同檔 | 選配 |

- 只存 **店名模糊比對成功** 的文章，避免雜訊
- 同步抓取 `og:image` / 文章首圖 → `image_url`，**MVP 圖片零成本**
- 輸出靜態 JSON，前端 `fetch('/data/bloggers.json')` 一次載入
- GitHub Actions 失敗 → Slack/Email 通知（可選）
- **W4 階段**：若覆蓋率不足，再啟用 Places Photo API fallback（策略 C）

---

## 10. 介面草圖（文字版）
```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 搜尋區域：[桃園藝文特區 ▼]  半徑：[===●===] 3.2 km       │
├─────────────────────────────────────────────────────────────┤
│ 分類 ☐街邊小吃 ☑日式 ☐韓式 ☐南美燒烤 ☐咖啡 ☐素食 …        │
│ 星等 ≥ [4.0]  人均 [200]–[800]  ☐營業中                     │
├──────────────────┬──────────────────────────────────────────┤
│   Google Map     │  右側列表（依距離/評分排序）              │
│   ● ●  ●         │  1. 壽司郎 🌟4.6 $450 營業中 [收藏]      │
│     ●    ●       │  2. 燒肉喜多方 🌟4.3 $600 營業中 [收藏]  │
│                  │  3. 街邊滷味 🌟4.1 $120 打烊   [收藏]    │
│                  │  📌 部落客推薦：「壽司郎」3 篇（近 1 年）  │
└──────────────────┴──────────────────────────────────────────┘
```

---

## 11. 里程碑
| 週期 | 交付物 | 狀態 |
|------|--------|------|
| W1 | 專案骨架（Vite + TS + Maps Loader）、基礎地圖、搜尋框、半徑滑桿 | ⬜ |
| W2 | Places Nearby Search 串接、分類/星等/價格/營業中篩選、側欄卡片 | ⬜ |
| W3 | 部落客爬蟲 GitHub Action（痞客邦 + PTT + 愛食記）、靜態 JSON 產出、前端關聯顯示 | ⬜ |
| W4 | 收藏 + 匯出 JSON/CSV、響應式 + 深色模式、部署 GitHub Pages | ⬜ |
| W5 | 使用者驗收、文件整理、決定是否公開化 | ⬜ |

---

## 12. 風險與對策
| 風險 | 等級 | 對策 |
|------|------|------|
| Google Maps 免費額度不夠 | 中 | ① 前端積極快取 ② 可關閉 Places Details 自動呼叫 ③ 預留 Mapbox/OSM 遷移介面 |
| 部落客網站改版導致爬蟲失效 | 中 | 選擇器抽象化、失敗通知、人工補抓 |
| Places type 覆蓋不全（如「街邊小吃」） | 低 | 自訂 type 映射表 + 關鍵字輔助搜尋 |
| API Key 外洩 | 高 | `.gitignore`、私有 repo、必要時走 Functions 代理、定期輪換 |

---

## 13. 已確認決策（原開放議題）
| 編號 | 議題 | 決策 | 理由 |
|------|------|------|------|
| 1 | 前端框架 | **React 18 + Vite + TS** | 官方 Maps wrapper、生態成熟、長期維護成本最低 |
| 2 | 部落客來源 | **痞客邦 + PTT + 愛食記** | 痞客邦/PTT 低維護、愛食記補強覆蓋率；FB/IG 排除（審核不確定） |
| 3 | 圖片策略 | **MVP 僅用部落客文章首圖（`og:image`）**，W4 再加 Places Photo API fallback | 零成本、預留 `image_url` 介面、未來平滑切換 |
| 4 | 多語系 | **i18next 預裝**，僅含 `zh-TW.json` | 10 分鐘設好、未來加語系只增檔不改碼 |

---

## 14. 確認簽核
> 請確認上述規格卡內容，**回覆「確認無誤」或提出修改**。確認後將 status 改為 `confirmed`，並可開始 Sprint 1 實作。

---
*本卡依 RDQ 流程產出，對應 `spec-template.md` 結構。修改請直接編輯此檔，並更新 status。*