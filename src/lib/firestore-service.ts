import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import { auth } from './firebase'

// ─── Helper: Get user-scoped collection path ───
function userCollection(collectionName: string) {
  const userId = auth.currentUser?.uid
  if (!userId) throw new Error('User not authenticated')
  return `users/${userId}/${collectionName}`
}

function userDoc(collectionName: string, docId: string) {
  const userId = auth.currentUser?.uid
  if (!userId) throw new Error('User not authenticated')
  return `users/${userId}/${collectionName}/${docId}`
}

// ─── Convert Firestore timestamps to ISO strings ───
function convertTimestamps(data: Record<string, any>): Record<string, any> {
  const converted = { ...data }
  for (const key of Object.keys(converted)) {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate().toISOString()
    }
  }
  return converted
}

// ─── Generic CRUD Operations ───

export async function firestoreGetAll<T extends { id: string }>(
  collectionName: string,
  orderByField: string = 'createdAt',
  orderDirection: 'asc' | 'desc' = 'desc'
): Promise<T[]> {
  try {
    const colRef = collection(db, userCollection(collectionName))
    const q = query(colRef, orderBy(orderByField, orderDirection))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => {
      const data = convertTimestamps(d.data())
      return { id: d.id, ...data } as T
    })
  } catch (error) {
    console.error(`[Firestore] Error fetching ${collectionName}:`, error)
    return []
  }
}

export async function firestoreGetById<T extends { id: string }>(
  collectionName: string,
  docId: string
): Promise<T | null> {
  try {
    const docRef = doc(db, userDoc(collectionName, docId))
    const snapshot = await getDoc(docRef)
    if (!snapshot.exists()) return null
    const data = convertTimestamps(snapshot.data())
    return { id: snapshot.id, ...data } as T
  } catch (error) {
    console.error(`[Firestore] Error fetching ${collectionName}/${docId}:`, error)
    return null
  }
}

export async function firestoreCreate<T extends Record<string, any>>(
  collectionName: string,
  data: T,
  customId?: string
): Promise<string> {
  try {
    const id = customId || doc(collection(db, userCollection(collectionName))).id
    const docRef = doc(db, userDoc(collectionName, id))
    const now = new Date().toISOString()
    await setDoc(docRef, {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    })
    return id
  } catch (error) {
    console.error(`[Firestore] Error creating ${collectionName}:`, error)
    throw error
  }
}

export async function firestoreUpdate(
  collectionName: string,
  docId: string,
  data: Record<string, any>
): Promise<void> {
  try {
    const docRef = doc(db, userDoc(collectionName, docId))
    const now = new Date().toISOString()
    await updateDoc(docRef, {
      ...data,
      updatedAt: now,
    })
  } catch (error) {
    console.error(`[Firestore] Error updating ${collectionName}/${docId}:`, error)
    throw error
  }
}

export async function firestoreDelete(
  collectionName: string,
  docId: string
): Promise<void> {
  try {
    const docRef = doc(db, userDoc(collectionName, docId))
    await deleteDoc(docRef)
  } catch (error) {
    console.error(`[Firestore] Error deleting ${collectionName}/${docId}:`, error)
    throw error
  }
}

// ─── Query with filters ───
export async function firestoreQuery<T extends { id: string }>(
  collectionName: string,
  filters: { field: string; operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains'; value: any }[],
  orderByField?: string,
  orderDirection: 'asc' | 'desc' = 'desc',
  resultLimit?: number
): Promise<T[]> {
  try {
    const colRef = collection(db, userCollection(collectionName))
    let q = query(colRef, ...filters.map(f => where(f.field, f.operator, f.value)))
    if (orderByField) q = query(q, orderBy(orderByField, orderDirection))
    if (resultLimit) q = query(q, limit(resultLimit))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => {
      const data = convertTimestamps(d.data())
      return { id: d.id, ...data } as T
    })
  } catch (error) {
    console.error(`[Firestore] Error querying ${collectionName}:`, error)
    return []
  }
}

// ─── Real-time listener ───
export function firestoreSubscribe<T extends { id: string }>(
  collectionName: string,
  orderByField: string,
  orderDirection: 'asc' | 'desc' = 'desc',
  callback: (items: T[]) => void,
  onError?: (error: Error) => void
): () => void {
  const colRef = collection(db, userCollection(collectionName))
  const q = query(colRef, orderBy(orderByField, orderDirection))
  return onSnapshot(q,
    (snapshot) => {
      const items = snapshot.docs.map(d => {
        const data = convertTimestamps(d.data())
        return { id: d.id, ...data } as T
      })
      callback(items)
    },
    (error) => {
      console.error(`[Firestore] Snapshot error for ${collectionName}:`, error)
      onError?.(error)
    }
  )
}

// ─── Batch write ───
export async function firestoreBatchCreate(
  collectionName: string,
  items: Record<string, any>[]
): Promise<void> {
  try {
    const batch = writeBatch(db)
    const now = new Date().toISOString()
    for (const item of items) {
      const id = item.id || doc(collection(db, userCollection(collectionName))).id
      const docRef = doc(db, userDoc(collectionName, id))
      batch.set(docRef, { ...item, id, createdAt: now, updatedAt: now })
    }
    await batch.commit()
  } catch (error) {
    console.error(`[Firestore] Batch create error for ${collectionName}:`, error)
    throw error
  }
}

// ─── User preferences (single document per user) ───
export async function firestoreGetPreferences<T>(key: string): Promise<T | null> {
  try {
    const userId = auth.currentUser?.uid
    if (!userId) return null
    const docRef = doc(db, `users/${userId}/preferences/${key}`)
    const snapshot = await getDoc(docRef)
    if (!snapshot.exists()) return null
    return snapshot.data() as T
  } catch (error) {
    console.error(`[Firestore] Error fetching preferences/${key}:`, error)
    return null
  }
}

export async function firestoreSetPreferences<T>(key: string, data: T): Promise<void> {
  try {
    const userId = auth.currentUser?.uid
    if (!userId) return
    const docRef = doc(db, `users/${userId}/preferences/${key}`)
    await setDoc(docRef, data, { merge: true })
  } catch (error) {
    console.error(`[Firestore] Error setting preferences/${key}:`, error)
  }
}

// ─── Check if user is authenticated ───
export function isUserAuthenticated(): boolean {
  return !!auth.currentUser?.uid
}
