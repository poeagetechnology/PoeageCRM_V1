import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp, type QueryConstraint,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export function createFirestoreService<T extends { id: string }>(collectionName: string) {
  const col = () => collection(db, collectionName)

  return {
    async getAll(constraints: QueryConstraint[] = []): Promise<T[]> {
      const q = constraints.length ? query(col(), ...constraints) : col()
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T))
    },

    async getById(id: string): Promise<T | null> {
      const snap = await getDoc(doc(db, collectionName, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null
    },

    async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
      const sanitizedData = Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== undefined)
      ) as Omit<T, 'id' | 'createdAt' | 'updatedAt'>

      const ref = await addDoc(col(), {
        ...sanitizedData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return { id: ref.id, ...sanitizedData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as unknown as T
    },

    async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<void> {
      const sanitizedData = Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== undefined)
      ) as Partial<Omit<T, 'id' | 'createdAt'>>
      if (Object.keys(sanitizedData).length === 0) {
        await updateDoc(doc(db, collectionName, id), { updatedAt: serverTimestamp() })
      } else {
        await updateDoc(doc(db, collectionName, id), { ...sanitizedData, updatedAt: serverTimestamp() })
      }
    },

    async delete(id: string): Promise<void> {
      await deleteDoc(doc(db, collectionName, id))
    },

    // Helpers
    where, orderBy, limit,
  }
}

export const clientsService = createFirestoreService<import('@/types').Client>('clients')
export const contactsService = createFirestoreService<import('@/types').Contact>('contacts')
export const projectsService = createFirestoreService<import('@/types').Project>('projects')
export const tasksService = createFirestoreService<import('@/types').Task>('tasks')
export const employeesService = createFirestoreService<import('@/types').Employee>('employees')
export const payrollService = createFirestoreService<import('@/types').PayrollRecord>('payroll')
