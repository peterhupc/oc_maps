import { useEffect, useRef, useState } from 'react'
import type { ParkingPlace } from '../types/parking'
import { loadMaps } from '../services/mapsLoader'

interface MapViewProps {
  center: { lat: number; lng: number }
  places: ParkingPlace[]
  selectedId: string | null
  selectedPlace: ParkingPlace | null
  onSelect: (place: ParkingPlace) => void
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

// 預設：白底＋藍旗；選中：深藍底＋白旗
const PIN_ICON = flagIcon('#ffffff', '#1c7ed6', '#495057', '#1c7ed6')
const PIN_ICON_ACTIVE = flagIcon('#1864ab', '#ffffff', '#ffffff', '#ffffff')

function truncate(s: string, n = 24): string {
  return s.length > n ? `${s.slice(0, n)}…` : s
}

function infoContent(place: ParkingPlace): string {
  const photo = place.photos?.[0]
  const a = place.availability
  const meta: string[] = []
  if (a) {
    if (a.available != null && a.total != null) {
      meta.push(`剩餘 ${a.available}/${a.total} 位`)
    } else if (a.available != null) {
      meta.push(`剩餘 ${a.available} 位`)
    }
    if (a.priceText) meta.push(truncate(a.priceText, 30))
    if (a.serviceTime) meta.push(`開放：${a.serviceTime}`)
    meta.push(a.city)
  }
  if (place.rating > 0) meta.push(`★ ${place.rating.toFixed(1)}`)
  if (place.opening_hours?.open_now != null) meta.push(place.opening_hours.open_now ? '開放中' : '已關閉')
  return (
    `<div style="min-width:180px;max-width:260px;">` +
    (photo ? `<img src="${photo}" alt="" style="width:100%;height:96px;object-fit:cover;border-radius:8px;margin-bottom:6px;"/>` : '') +
    `<strong>${place.name}</strong>` +
    (meta.length ? `<div style="color:#6c757d;font-size:12px;margin-top:4px;">${meta.join('<br/>')}</div>` : '') +
    (a?.address ? `<div style="color:#adb5bd;font-size:11px;margin-top:2px;">${a.address}</div>` : '') +
    `</div>`
  )
}

export default function MapView({ center, places, selectedId, selectedPlace, onSelect, onCenterChange }: MapViewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<{ id: string; marker: google.maps.Marker }[]>([])
  const infoRef = useRef<google.maps.InfoWindow | null>(null)
  const tempMarkerRef = useRef<google.maps.Marker | null>(null)
  const [mapReady, setMapReady] = useState(false)

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

  useEffect(() => {
    const map = mapRef.current
    const info = infoRef.current
    if (!map || !info || !mapReady) return

    markersRef.current.forEach((m) => m.marker.setMap(null))
    markersRef.current = []
    info.close()

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
  }, [places, mapReady])

  useEffect(() => {
    for (const m of markersRef.current) {
      m.marker.setIcon(m.id === selectedId ? PIN_ICON_ACTIVE : PIN_ICON)
    }
  }, [selectedId])

  useEffect(() => {
    const map = mapRef.current
    const info = infoRef.current
    if (!map || !info || !mapReady) return

    if (tempMarkerRef.current) {
      tempMarkerRef.current.setMap(null)
      tempMarkerRef.current = null
    }

    if (!selectedPlace) {
      info.close()
      return
    }

    const found = markersRef.current.find((m) => m.id === selectedPlace.place_id)
    if (found) {
      map.panTo(found.marker.getPosition() ?? selectedPlace.location)
      info.setContent(infoContent(selectedPlace))
      info.open({ map, anchor: found.marker })
    } else {
      const marker = new google.maps.Marker({
        map,
        position: selectedPlace.location,
        title: selectedPlace.name,
        icon: PIN_ICON_ACTIVE,
      })
      tempMarkerRef.current = marker
      map.panTo(selectedPlace.location)
      info.setContent(infoContent(selectedPlace))
      info.open({ map, anchor: marker })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlace, mapReady])

  return <div ref={ref} className="map-canvas" />
}