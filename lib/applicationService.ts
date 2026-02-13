import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp,
} from "firebase/firestore";

// --- Types ---

export type ApplicationStatus = "saved" | "applied" | "interviewing" | "offer" | "rejected";

export interface Application {
    id?: string;
    userId: string;
    company: string;
    role: string;
    url: string;
    status: ApplicationStatus;
    notes: string;
    salary: string;
    location: string;
    appliedDate: string;
    source: string; // "manual" | "generator"
    createdAt?: any;
    updatedAt?: any;
}

export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bgColor: string; borderColor: string }> = {
    saved: { label: "Saved", color: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20" },
    applied: { label: "Applied", color: "text-orange-400", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/20" },
    interviewing: { label: "Interviewing", color: "text-purple-400", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/20" },
    offer: { label: "Offer", color: "text-green-400", bgColor: "bg-green-500/10", borderColor: "border-green-500/20" },
    rejected: { label: "Rejected", color: "text-zinc-400", bgColor: "bg-zinc-500/10", borderColor: "border-zinc-500/20" },
};

export const STATUSES: ApplicationStatus[] = ["saved", "applied", "interviewing", "offer", "rejected"];

// --- CRUD ---

export async function createApplication(data: Omit<Application, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const docRef = await addDoc(collection(db, "applications"), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function getApplications(userId: string): Promise<Application[]> {
    const q = query(
        collection(db, "applications"),
        where("userId", "==", userId)
    );
    const snap = await getDocs(q);
    const apps = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Application));
    return apps.sort((a, b) => {
        const aTime = a.updatedAt?.toMillis?.() || 0;
        const bTime = b.updatedAt?.toMillis?.() || 0;
        return bTime - aTime;
    });
}

export async function updateApplication(id: string, data: Partial<Application>): Promise<void> {
    await updateDoc(doc(db, "applications", id), {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteApplication(id: string): Promise<void> {
    await deleteDoc(doc(db, "applications", id));
}
