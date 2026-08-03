import { useCallback, useEffect, useRef, useState } from 'react'
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import {
  getFirebaseDb,
  loginWithGoogle,
  logout as firebaseLogout,
  onAuthChange,
} from '../lib/firebase'
import type { FoodPlace } from '../types/food'

const KEY = 'foodmap_favorites'

export interface FavoriteItem extends FoodPlace {
  savedAt: number
}

function loadLocal(): FavoriteItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(raw) ? (raw as FavoriteItem[]) : []
  } catch {
    return []
  }
}

function saveLocal(items: FavoriteItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {
    // 儲存空間滿或不可用時忽略
  }
}

function mergeFavorites(a: FavoriteItem[], b: FavoriteItem[]): FavoriteItem[] {
  const map = new Map<string, FavoriteItem>()
  for (const item of [...a, ...b]) {
    const existing = map.get(item.place_id)
    if (!existing || item.savedAt > existing.savedAt) map.set(item.place_id, item)
  }
  return [...map.values()].sort((x, y) => y.savedAt - x.savedAt)
}

export function useFavorites() {
  const [user, setUser] = useState<User | null>(null)
  const [favorites, setFavorites] = useState<FavoriteItem[]>(loadLocal)
  const favoritesRef = useRef(favorites)
  favoritesRef.current = favorites

  useEffect(() => onAuthChange((u) => setUser(u)), [])

  const syncCloud = useCallback(async (uid: string, items: FavoriteItem[]) => {
    const db = getFirebaseDb()
    if (!db) return
    const favColl = collection(db, `users/${uid}/favorites`)
    const snap = await getDocs(favColl)
    const cloudIds = new Set(snap.docs.map((d) => d.id))
    const itemIds = new Set(items.map((i) => i.place_id))
    await Promise.all([
      ...items.map((item) => setDoc(doc(favColl, item.place_id), item)),
      ...[...cloudIds].filter((id) => !itemIds.has(id)).map((id) => deleteDoc(doc(favColl, id))),
    ])
  }, [])

  useEffect(() => {
    if (!user) return
    const db = getFirebaseDb()
    if (!db) return
    let cancelled = false
    void (async () => {
      const snap = await getDocs(collection(db, `users/${user.uid}/favorites`))
      if (cancelled) return
      const cloud = snap.docs.map((d) => d.data() as FavoriteItem)
      const merged = mergeFavorites(favoritesRef.current, cloud)
      saveLocal(merged)
      setFavorites(merged)
      void syncCloud(user.uid, merged)
    })()
    return () => {
      cancelled = true
    }
  }, [user, syncCloud])

  const toggle = useCallback(
    (place: FoodPlace) => {
      setFavorites((prev) => {
        const exists = prev.some((f) => f.place_id === place.place_id)
        const next = exists
          ? prev.filter((f) => f.place_id !== place.place_id)
          : [{ ...place, savedAt: Date.now() }, ...prev]
        saveLocal(next)
        const db = getFirebaseDb()
        if (user && db) {
          const favRef = doc(db, `users/${user.uid}/favorites/${place.place_id}`)
          if (exists) void deleteDoc(favRef)
          else void setDoc(favRef, { ...place, savedAt: Date.now() })
        }
        return next
      })
    },
    [user]
  )

  const login = useCallback(async () => {
    await loginWithGoogle()
  }, [])

  const logout = useCallback(async () => {
    await firebaseLogout()
  }, [])

  return { favorites, toggle, login, logout, user }
}
