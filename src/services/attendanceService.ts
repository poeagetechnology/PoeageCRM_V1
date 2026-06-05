import {
  collection,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AttendanceRecord } from "@/types";

export const attendanceService = {
  async punchIn(userId: string, userName: string, userEmail: string) {
    const today = new Date().toISOString().split("T")[0];

    // Check if already punched in today
    const existing = await getDocs(
      query(
        collection(db, "attendance"),
        where("userId", "==", userId),
        where("date", "==", today),
        where("status", "==", "punched_in"),
      ),
    );

    if (existing.docs.length > 0) {
      throw new Error("Already punched in today");
    }

    const record: Omit<AttendanceRecord, "id"> = {
      userId,
      userName,
      userEmail,
      punchInTime: new Date().toISOString(),
      date: today,
      status: "punched_in",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, "attendance"), {
      ...record,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { ...record, id: docRef.id } as AttendanceRecord;
  },

  async punchOut(userId: string, recordId: string) {
    const docRef = doc(db, "attendance", recordId);
    const now = new Date();
    const punchOutTime = now.toISOString();

    // Get the punch in record to calculate hours
    const docSnap = await getDocs(
      query(collection(db, "attendance"), where("id", "==", recordId)),
    );

    let punchInTime: Date | null = null;
    if (docSnap.docs.length > 0) {
      const data = docSnap.docs[0].data();
      punchInTime = new Date(data.punchInTime);
    }

    const workingHours = punchInTime
      ? (now.getTime() - punchInTime.getTime()) / (1000 * 60 * 60)
      : 0;

    await updateDoc(docRef, {
      punchOutTime,
      workingHours: Number(workingHours.toFixed(2)),
      status: "punched_out",
      updatedAt: serverTimestamp(),
    });

    return {
      punchOutTime,
      workingHours: Number(workingHours.toFixed(2)),
      status: "punched_out",
    };
  },

  async getTodayRecord(userId: string) {
    const today = new Date().toISOString().split("T")[0];

    const docs = await getDocs(
      query(
        collection(db, "attendance"),
        where("userId", "==", userId),
        where("date", "==", today),
      ),
    );

    if (docs.docs.length === 0) return null;
    return {
      ...(docs.docs[0].data() as Record<string, any>),
      id: docs.docs[0].id,
    } as AttendanceRecord;
  },

  async getUserAttendance(userId: string, limit: number = 50) {
    const docs = await getDocs(
      query(
        collection(db, "attendance"),
        where("userId", "==", userId),
        orderBy("date", "desc"),
      ),
    );

    return docs.docs.slice(0, limit).map((doc) => ({
      ...(doc.data() as Record<string, any>),
      id: doc.id,
    })) as AttendanceRecord[];
  },

  async getAllAttendance(limit: number = 200) {
    const docs = await getDocs(
      query(collection(db, "attendance"), orderBy("createdAt", "desc")),
    );

    return docs.docs.slice(0, limit).map((doc) => ({
      ...(doc.data() as Record<string, any>),
      id: doc.id,
    })) as AttendanceRecord[];
  },

  async getAttendanceByDateRange(
    startDate: string,
    endDate: string,
    userId?: string,
  ) {
    let q: any;

    if (userId) {
      q = query(
        collection(db, "attendance"),
        where("userId", "==", userId),
        where("date", ">=", startDate),
        where("date", "<=", endDate),
        orderBy("date", "desc"),
      );
    } else {
      q = query(
        collection(db, "attendance"),
        where("date", ">=", startDate),
        where("date", "<=", endDate),
        orderBy("date", "desc"),
      );
    }

    const docs = await getDocs(q);
    return docs.docs.map((doc) => ({
      ...(doc.data() as Record<string, any>),
      id: doc.id,
    })) as AttendanceRecord[];
  },

  async deleteRecord(recordId: string) {
    const docRef = doc(db, "attendance", recordId);
    await updateDoc(docRef, {
      status: "absent",
      updatedAt: serverTimestamp(),
    });
  },
};
