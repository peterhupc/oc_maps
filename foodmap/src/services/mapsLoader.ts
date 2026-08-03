let mapsPromise: Promise<typeof google.maps> | null = null

interface MapsWindow extends Window {
  google?: { maps?: typeof google.maps }
  __foodmapMapsReady?: () => void
}

export function loadMaps(): Promise<typeof google.maps> {
  if (mapsPromise) return mapsPromise

  const apiKey = import.meta.env.VITE_GMAPS_KEY
  if (!apiKey) {
    return Promise.reject(
      new Error('缺少 VITE_GMAPS_KEY：請在 foodmap/.env.local 設定 Google Maps API Key')
    )
  }

  mapsPromise = new Promise((resolve, reject) => {
    const w = window as MapsWindow

    if (w.google?.maps) {
      resolve(google.maps)
      return
    }

    w.__foodmapMapsReady = () => resolve(google.maps)

    const script = document.createElement('script')
    script.src =
      'https://maps.googleapis.com/maps/api/js' +
      '?key=' + encodeURIComponent(apiKey) +
      '&libraries=places&language=zh-TW&region=TW&callback=__foodmapMapsReady'
    script.async = true
    script.defer = true
    script.onerror = () => reject(new Error('Google Maps script 載入失敗'))
    document.head.appendChild(script)
  })

  return mapsPromise
}
