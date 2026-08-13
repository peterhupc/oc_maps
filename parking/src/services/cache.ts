import type { ParkingPlace } from '../types/parking'

const DB_NAME = 'parking'
const STORE_NAME = 'places'
const DB_VERSION = 1

interface CachedPlace extends ParkingPlace {
  _cached: number
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'place_id' })
      }
    }
  })
}

export async function setPlace(place: ParkingPlace): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put({ ...place, _cached: Date.now() })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getCachedPlace(
  place_id: string,
  ttl = 24 * 3600 * 1000
): Promise<ParkingPlace | null> {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(place_id)
    req.onsuccess = () => {
      const data = req.result as CachedPlace | undefined
      resolve(data && Date.now() - data._cached < ttl ? data : null)
    }
    req.onerror = () => resolve(null)
  })
}