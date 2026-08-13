import { useEffect, useRef, useState } from 'react'
import type { FoodPlace } from '../types/food'
import { loadMaps } from '../services/mapsLoader'

interface MapViewProps {
  center: { lat: number; lng: number }
  places: FoodPlace[]
  pinnedPlaces: FoodPlace[]
  selectedId: string | null
  onSelect: (place: FoodPlace) => void
  onCenterChange: (c: { lat: number; lng: number }) => void
}

const flagIcon = (body: string, border: string, pole: string, pennant: string): string =>
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='36' viewBox='0 0 28 36'>
  <path d='M14 35.5 5 20.3C3.3 17.3 2.5 14.1 2.5 11.2 2.5 5.1 7.7.8 14 .8c6.3 0 11.5 4.3 11.5 10.4 0 2.9-.8 6.1-2.5 9.1z' fill='${body}' stroke='${border}' stroke-width='2'/>
  <rect x='11.6' y='5' width='1.8' height='11' rx='.9' fill='${pole}'/>
  <path d='M13.4 5.4 21.4 7.8 13.4 10.2z' fill='${pennant}'/>
</svg>`
  )

// 預設：白底＋橘旗；選中：藍底＋白旗
const PIN_ICON = flagIcon('#ffffff', '#e8590c', '#495057', '#e8590c')
const PIN_ICON_ACTIVE = flagIcon('#1971c2', '#ffffff', '#ffffff', '#ffffff')

function infoContent(place: FoodPlace): string {
  const photo = place.photos?.[0]
  const meta: string[] = []
  if (place.rating > 0) meta.push(`★ ${place.rating.toFixed(1)}`)
  if (place.price_level != null) meta.push('$'.repeat(place.price_level + 1))
  if (place.opening_hours?.open_now != null) meta.push(place.opening_hours.open_now ? '營業中' : '已打烊')
  return (
    `<div style="min-width:180px;max-width:240px;">` +
    (photo ? `<img src="${photo}" alt="" style="width:100%;height:96px;object-fit:cover;border-radius:8px;margin-bottom:6px;"/>` : '') +
    `<strong>${place.name}</strong>` +
    (meta.length ? `<div style="color:#6c757d;font-size:12px;margin-top:2px;">${meta.join(' · ')}</div>` : '') +
    `</div>`
  )
}

export default function MapView({ center, places, pinnedPlaces, selectedId, onSelect, onCenterChange }: MapViewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<{ id: string; marker: google.maps.Marker }[]>([])
  const infoRef = useRef<google.maps.InfoWindow | null>(null)
  const placesRef = useRef<FoodPlace[]>([])
  const [mapReady, setMapReady] = useState(false)
  placesRef.current = places

  useEffect(() => {
    let cancelled = false
    loadMaps().then((maps) => {
      if (cancelled || !ref.current || mapRef.current) return
      const map = new maps.Map(ref.current, {
        center,
        zoom: 14,
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false,
      })
      mapRef.current = map
      infoRef.current = new maps.InfoWindow()
      map.addListener('dragend', () => {
        const c = map.getCenter()
        if (c) onCenterChange({ lat: c.lat(), lng: c.lng() })
      })
      setMapReady(true)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.panTo(center)
  }, [center])

  // 渲染旗標：places 或地圖就緒時
  useEffect(() => {
    const map = mapRef.current
    const info = infoRef.current
    if (!map || !info || !mapReady) return

    markersRef.current.forEach((m) => m.marker.setMap(null))
    markersRef.current = []
    info.close()

    const byId = new Map<string, FoodPlace>()
    for (const p of places) byId.set(p.place_id, p)
    for (const p of pinnedPlaces) byId.set(p.place_id, p)

    for (const place of byId.values()) {
      const marker = new google.maps.Marker({
        map,
        position: place.location,
        title: place.name,
        animation: google.maps.Animation.DROP,
        icon: place.place_id === selectedId ? PIN_ICON_ACTIVE : PIN_ICON,
      })
      marker.addListener('click', () => {
        onSelect(place)
        info.setContent(infoContent(place))
        info.open({ map, anchor: marker })
      })
      markersRef.current.push({ id: place.place_id, marker })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places, pinnedPlaces, mapReady])

  // 選中狀態只換旗標顏色，不重建 marker
  useEffect(() => {
    for (const m of markersRef.current) {
      m.marker.setIcon(m.id === selectedId ? PIN_ICON_ACTIVE : PIN_ICON)
    }
  }, [selectedId])

  // 選中時 panTo 並開資訊窗
  useEffect(() => {
    const map = mapRef.current
    const info = infoRef.current
    if (!map || !info || !mapReady) return

    if (!selectedId) {
      info.close()
      return
    }

    const found = markersRef.current.find((m) => m.id === selectedId)
    if (!found) return
    const place = placesRef.current.find((p) => p.place_id === selectedId)
    if (!place) return
    map.panTo(found.marker.getPosition() ?? center)
    info.setContent(infoContent(place))
    info.open({ map, anchor: found.marker })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, mapReady])

  return <div ref={ref} className="map-canvas" />
}
