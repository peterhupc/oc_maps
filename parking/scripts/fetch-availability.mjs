// 抓取北台三都（台北／新北／桃園）路外停車場即時剩餘車位，產出 public/data/availability.json
// 用法：node scripts/fetch-availability.mjs
// 資料源：
//   台北：https://tcgbusfs.blob.core.windows.net/blobtcmsv/TCMSV_alldesc.json（靜態）＋ TCMSV_allavailable.json（即時），join by id
//   新北：https://data.ntpc.gov.tw/api/datasets/b1464ef0-9c7c-4a6f-abf7-6bdf32847e68/json（靜態）＋ e09b35a5-...（即時），join by ID
//   桃園：https://opendata.tycg.gov.tw/api/dataset/f4cc0b12-.../resource/0381e141-.../download（單一即時）

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../public/data/availability.json')

const MAX_AVAILABLE = 1000000

// ---- TWD97 (TM2 zone 121) → WGS84 經緯度 ----
function twd97ToWgs84(x, y) {
  const a = 6378137
  const f = 1 / 298.257222101
  const e2 = f * (2 - f)
  const e4 = e2 * e2
  const e6 = e4 * e2
  const k0 = 0.9999
  const lon0 = (121 * Math.PI) / 180
  const falseE = 250000
  const n = (y - 0) / k0
  const mu =
    n / (a * (1 - e2 / 4 - (3 * e4) / 64 - (5 * e6) / 256))
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2))
  const e1_2 = e1 * e1
  const e1_3 = e1_2 * e1
  const e1_4 = e1_3 * e1
  const phi1 =
    mu +
    ((3 * e1) / 2 - (27 * e1_3) / 32) * Math.sin(2 * mu) +
    ((21 * e1_2) / 16 - (55 * e1_4) / 32) * Math.sin(4 * mu) +
    ((151 * e1_3) / 96) * Math.sin(6 * mu) +
    ((1097 * e1_4) / 512) * Math.sin(8 * mu)
  const N1 = a / Math.sqrt(1 - e2 * Math.sin(phi1) ** 2)
  const T1 = Math.tan(phi1) ** 2
  const C1 = (e2 * Math.cos(phi1) ** 2) / (1 - e2)
  const R1 = (a * (1 - e2)) / (1 - e2 * Math.sin(phi1) ** 2) ** 1.5
  const D = (x - falseE) / (N1 * k0)
  const lat =
    phi1 -
    ((N1 * Math.tan(phi1)) / R1) *
      ((D * D) / 2 -
        ((5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * e2) * D ** 4) / 24 +
        ((61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * e2 - 3 * C1 * C1) * D ** 6) / 720)
  const lon =
    lon0 +
    (D -
      ((1 + 2 * T1 + C1) * D ** 3) / 6 +
      ((5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * e2 + 24 * T1 * T1) * D ** 5) / 120) /
      Math.cos(phi1)
  return { lat: (lat * 180) / Math.PI, lng: (lon * 180) / Math.PI }
}

function toNum(v) {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

// -9 / 負值 → null（無即時資料）
function avail(v) {
  const n = toNum(v)
  return n === null || n < 0 || n > MAX_AVAILABLE ? null : n
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'oc_maps-parking-fetch' } })
  if (!res.ok) throw new Error(`${url} HTTP ${res.status}`)
  return res.json()
}

// ---- 台北 ----
async function fetchTaipei() {
  const [desc, live] = await Promise.all([
    fetchJson('https://tcgbusfs.blob.core.windows.net/blobtcmsv/TCMSV_alldesc.json'),
    fetchJson('https://tcgbusfs.blob.core.windows.net/blobtcmsv/TCMSV_allavailable.json'),
  ])
  const descPark = desc.data?.park ?? []
  const liveMap = new Map((live.data?.park ?? []).map((p) => [String(p.id), p]))
  const out = []
  for (const p of descPark) {
    const id = String(p.id)
    const live = liveMap.get(id)
    const xy = twd97ToWgs84(toNum(p.tw97x), toNum(p.tw97y))
    out.push({
      id: `TPE:${id}`,
      city: '臺北市',
      name: p.name ?? id,
      address: p.address ?? '',
      lat: xy.lat,
      lng: xy.lng,
      total: toNum(p.totalcar),
      available: avail(live?.availablecar),
      priceText: p.payex ?? '',
      serviceTime: p.serviceTime ?? '',
    })
  }
  return out
}

// ---- 新北 ----
async function fetchNewTaipei() {
  const [desc, live] = await Promise.all([fetchAllNtpcStatic(), fetchAllNtpcDynamic()])
  const liveMap = new Map(live.map((p) => [String(p.ID), p]))
  const out = []
  for (const p of desc) {
    const id = String(p.ID)
    const l = liveMap.get(id)
    const xy = twd97ToWgs84(toNum(p.TW97X), toNum(p.TW97Y))
    out.push({
      id: `NTPC:${id}`,
      city: '新北市',
      name: p.NAME ?? id,
      address: p.ADDRESS ?? '',
      lat: xy.lat,
      lng: xy.lng,
      total: toNum(p.TOTALCAR),
      available: avail(l?.AVAILABLECAR),
      priceText: p.PAYEX ?? '',
      serviceTime: p.SERVICETIME ?? '',
    })
  }
  return out
}

async function fetchAllNtpcStatic() {
  const PAGE_SIZE = 1000
  const all = []
  for (let page = 0; page < 10; page++) {
    const batch = await fetchJson(
      `https://data.ntpc.gov.tw/api/datasets/b1464ef0-9c7c-4a6f-abf7-6bdf32847e68/json?page=${page}&size=${PAGE_SIZE}`
    )
    if (!Array.isArray(batch) || batch.length === 0) break
    all.push(...batch)
    if (batch.length < PAGE_SIZE) break
  }
  return all
}

async function fetchAllNtpcDynamic() {
  const PAGE_SIZE = 1000
  const all = []
  for (let page = 0; page < 5; page++) {
    const batch = await fetchJson(
      `https://data.ntpc.gov.tw/api/datasets/e09b35a5-a738-48cc-b0f5-570b67ad9c78/json?page=${page}&size=${PAGE_SIZE}`
    )
    if (!Array.isArray(batch) || batch.length === 0) break
    all.push(...batch)
    if (batch.length < PAGE_SIZE) break
  }
  return all
}

// ---- 桃園 ----
async function fetchTaoyuan() {
  const rows = await fetchJson(
    'https://opendata.tycg.gov.tw/api/dataset/f4cc0b12-86ac-40f9-8745-885bddc18f79/resource/0381e141-f7ee-450e-99da-2240208d1773/download'
  )
  return rows.map((p) => ({
    id: `TYG:${p.parkId}`,
    city: '桃園市',
    name: p.parkName ?? p.parkId,
    address: p.address ?? '',
    lat: toNum(p.wgsX),
    lng: toNum(p.wgsY),
    total: toNum(p.totalSpace),
    available: avail(p.surplusSpace),
    priceText: p.payGuide ?? '',
    serviceTime: '',
  }))
}

async function main() {
  const [taipei, newTaipei, taoyuan] = await Promise.all([
    fetchTaipei().catch((e) => {
      console.error('台北抓取失敗：', e.message)
      return []
    }),
    fetchNewTaipei().catch((e) => {
      console.error('新北抓取失敗：', e.message)
      return []
    }),
    fetchTaoyuan().catch((e) => {
      console.error('桃園抓取失敗：', e.message)
      return []
    }),
  ])

  const lots = [...taipei, ...newTaipei, ...taoyuan]
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
    .sort((a, b) => a.city.localeCompare(b.city, 'zh-Hant-TW') || a.name.localeCompare(b.name, 'zh-Hant-TW'))

  const payload = {
    updatedAt: new Date().toISOString(),
    source: '台北／新北／桃園市政府開放資料',
    count: lots.length,
    lots,
  }

  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, JSON.stringify(payload, null, 2), 'utf-8')
  const withLive = lots.filter((p) => p.available !== null).length
  console.log(`OK 寫入 ${OUT}`)
  console.log(`總數 ${lots.length}（有即時車位 ${withLive}）｜台北 ${taipei.length}｜新北 ${newTaipei.length}｜桃園 ${taoyuan.length}`)
}

main().catch((e) => {
  console.error('執行失敗：', e)
  process.exit(1)
})