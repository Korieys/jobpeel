import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";

// --- Types ---

export interface PersonalInfo {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
}

export interface ExperienceItem {
    id: string;
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    current: boolean;
    bullets: string[];
}

export interface EducationItem {
    id: string;
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    gpa: string;
}

export interface SkillCategory {
    id: string;
    category: string;
    skills: string[];
}

export interface ProjectItem {
    id: string;
    name: string;
    description: string;
    technologies: string;
    link: string;
}

export interface ResumeData {
    personalInfo: PersonalInfo;
    summary: string;
    experience: ExperienceItem[];
    education: EducationItem[];
    skills: SkillCategory[];
    projects: ProjectItem[];
}

export interface Resume {
    id?: string;
    userId: string;
    title: string;
    template: "clean" | "modern" | "classic";
    data: ResumeData;
    createdAt?: any;
    updatedAt?: any;
}

// --- Defaults ---

export const emptyPersonalInfo: PersonalInfo = {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
};

export const emptyResumeData: ResumeData = {
    personalInfo: { ...emptyPersonalInfo },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
};

// --- ID Generator ---
export const generateId = () => Math.random().toString(36).substring(2, 10);

// --- Firestore CRUD ---

export async function createResume(userId: string, title: string): Promise<string> {
    const docRef = await addDoc(collection(db, "resumes"), {
        userId,
        title,
        template: "clean",
        data: emptyResumeData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function getResumes(userId: string): Promise<Resume[]> {
    const q = query(
        collection(db, "resumes"),
        where("userId", "==", userId)
    );
    const snap = await getDocs(q);
    const resumes = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Resume));
    // Sort client-side to avoid needing a Firestore composite index
    return resumes.sort((a, b) => {
        const aTime = a.updatedAt?.toMillis?.() || 0;
        const bTime = b.updatedAt?.toMillis?.() || 0;
        return bTime - aTime;
    });
}

export async function getResume(resumeId: string): Promise<Resume | null> {
    const docRef = doc(db, "resumes", resumeId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Resume;
}

export async function updateResume(resumeId: string, data: Partial<Resume>): Promise<void> {
    const docRef = doc(db, "resumes", resumeId);
    await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteResume(resumeId: string): Promise<void> {
    await deleteDoc(doc(db, "resumes", resumeId));
}
