import { loadMaps } from './mapsLoader'

export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  const maps = await loadMaps()
  const geocoder = new maps.Geocoder()

  return new Promise((resolve) => {
    geocoder.geocode({ address, region: 'TW' }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const loc = results[0].geometry.location
        resolve({ lat: loc.lat(), lng: loc.lng() })
      } else {
        resolve(null)
      }
    })
  })
}
