import { getFirestore, collection, addDoc, getDocs, doc, setDoc, deleteDoc, query, where } from "firebase/firestore"
import { firebaseApp } from "./firebase"

export const db = getFirestore(firebaseApp)

export const collections = [
  "users", "farms", "crops", "livestock", "soil", "inventory", "harvests",
  "irrigation", "markets", "orders", "suppliers", "subsidies", "passports",
  "finance", "insurance", "alerts", "community", "verification", "audit",
  "security", "blockchain",
]

export async function seedCollections() {
  for (const name of collections) {
    const snap = await getDocs(collection(db, name))
    if (snap.empty) {
      await addDoc(collection(db, name), { seeded: true, createdAt: new Date().toISOString() })
    }
  }
}

export { collection, addDoc, getDocs, doc, setDoc, deleteDoc, query, where }