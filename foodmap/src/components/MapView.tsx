import { useEffect, useRef } from 'react'
import type { FoodPlace } from '../types/food'
import { loadMaps } from '../services/mapsLoader'

interface MapViewProps {
  center: { lat: number; lng: number }
  places: FoodPlace[]
  selectedId: string | null
  onSelect: (place: FoodPlace) => void
  onCenterChange: (c: { lat: number; lng: number }) => void
}

const PIN_ICON = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='36' viewBox='0 0 28 36'><path d='M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.3 21.7 0 14 0z' fill='%23e8590c'/><circle cx='14' cy='14' r='5' fill='white'/></svg>`
)
const PIN_ICON_ACTIVE = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='36' viewBox='0 0 28 36'><path d='M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.3 21.7 0 14 0z' fill='%231971c2'/><circle cx='14' cy='14' r='5' fill='white'/></svg>`
)

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

export default function MapView({ center, places, selectedId, onSelect, onCenterChange }: MapViewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<{ id: string; marker: google.maps.Marker }[]>([])
  const infoRef = useRef<google.maps.InfoWindow | null>(null)
  const placesRef = useRef<FoodPlace[]>([])
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

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const info = infoRef.current
    if (!info) return

    markersRef.current.forEach((m) => m.marker.setMap(null))
    markersRef.current = []

    for (const place of places) {
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
  }, [places, selectedId])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const info = infoRef.current
    if (!info) return

    const found = markersRef.current.find((m) => m.id === selectedId)
    if (!found) return
    const place = placesRef.current.find((p) => p.place_id === selectedId)
    if (!place) return
    map.panTo(found.marker.getPosition() ?? center)
    info.setContent(infoContent(place))
    info.open({ map, anchor: found.marker })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  return <div ref={ref} className="map-canvas" />
}
