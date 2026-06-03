import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { User } from "@/types";

export const authService = {
  async signIn(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    return snap.data() as User;
  },

  async signUp(
    email: string,
    password: string,
    displayName: string,
    role: string = "developer",
  ) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    const user: User = {
      uid: cred.user.uid,
      email,
      displayName,
      role: role as User["role"],
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, "users", cred.user.uid), {
      ...user,
      createdAt: serverTimestamp(),
    });
    return user;
  },

  async signOut() {
    await signOut(auth);
  },

  async getProfile(uid: string): Promise<User | null> {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? (snap.data() as User) : null;
  },

  onAuthStateChange(cb: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, cb);
  },
};
