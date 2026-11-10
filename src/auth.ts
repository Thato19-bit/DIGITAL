import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth"
import { firebaseApp } from "./firebase"

export const auth = getAuth(firebaseApp)

export const login = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password)
export const register = (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password)
export const logout = () => signOut(auth)
export const onUser = (cb: (u: any) => void) => onAuthStateChanged(auth, cb)