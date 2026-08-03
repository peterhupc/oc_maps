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

export default function MapView({ center, places, selectedId, onSelect, onCenterChange }: MapViewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<{ id: string; marker: google.maps.Marker }[]>([])
  const infoRef = useRef<google.maps.InfoWindow | null>(null)

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
      map.addListener('center_changed', () => {
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
      })
      marker.addListener('click', () => {
        onSelect(place)
        info.setContent(
          `<strong>${place.name}</strong><br/>${place.rating ? '★ ' + place.rating.toFixed(1) : ''}`
        )
        info.open({ map, anchor: marker })
      })
      markersRef.current.push({ id: place.place_id, marker })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const found = markersRef.current.find((m) => m.id === selectedId)
    if (found) {
      google.maps.event.trigger(found.marker, 'click')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  return <div ref={ref} className="map-canvas" />
}
