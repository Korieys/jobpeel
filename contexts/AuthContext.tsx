"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    User,
    GoogleAuthProvider
} from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const registerCollegeIfEdu = async (email: string) => {
    if (!email || typeof email !== 'string') return;
    const lowerEmail = email.toLowerCase().trim();
    if (lowerEmail.endsWith('.edu')) {
        try {
            const domain = lowerEmail.split('@')[1];
            if (!domain) return;

            const waitlistRef = collection(db, "jobpeel_waitlist");
            const q = query(waitlistRef, where("domains", "array-contains", domain));
            const snap = await getDocs(q);

            if (snap.empty) {
                await addDoc(waitlistRef, {
                    programName: domain,
                    domains: [domain],
                    admin_emails: [],
                    createdAt: new Date().toISOString()
                });
            }
        } catch (e) {
            console.error("Failed to auto-register college:", e);
        }
    }
};

export interface UserProfile {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: string;
    photoURL?: string;
    bio?: string;
    title?: string;
    generationsUsed?: number;
    isUniversityUser?: boolean;
    isSuperAdmin?: boolean;
}

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
    refreshGenerations: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Check if an email belongs to an approved university domain
    const checkUniversityStatus = async (email: string): Promise<boolean> => {
        try {
            const waitlistRef = collection(db, "jobpeel_waitlist");
            const snap = await getDocs(waitlistRef);
            for (const docSnap of snap.docs) {
                const data = docSnap.data();
                const domains: string[] = data.domains || [];
                if (domains.some((d: string) => email.toLowerCase().endsWith("@" + d.toLowerCase()))) {
                    return true;
                }
            }
        } catch (e) {
            console.error("University check error:", e);
        }
        return false;
    };

    const loadUserProfile = useCallback(async (firebaseUser: User) => {
        try {
            const docRef = doc(db, "users", firebaseUser.uid);
            const docSnap = await getDoc(docRef);
            const email = firebaseUser.email || "";

            const isUniversityUser = await checkUniversityStatus(email);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setUserProfile({
                    ...data as UserProfile,
                    generationsUsed: data.generationsUsed ?? 0,
                    isUniversityUser,
                    isSuperAdmin: !!data.isSuperAdmin,
                });
            } else {
                const newProfile: UserProfile = {
                    email,
                    photoURL: firebaseUser.photoURL || "",
                    firstName: firebaseUser.displayName?.split(" ")[0] || "",
                    lastName: firebaseUser.displayName?.split(" ").slice(1).join(" ") || "",
                    generationsUsed: 0,
                    isUniversityUser,
                    isSuperAdmin: false,
                };
                setUserProfile(newProfile);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                await loadUserProfile(firebaseUser);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [loadUserProfile]);

    // Call this after a successful generation to update the count in context
    const refreshGenerations = useCallback(async () => {
        if (!user) return;
        try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUserProfile(prev => prev ? { ...prev, generationsUsed: data.generationsUsed ?? 0 } : prev);
            }
        } catch (e) {
            console.error("Error refreshing generations:", e);
        }
    }, [user]);

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const firebaseUser = result.user;

            const docRef = doc(db, "users", firebaseUser.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                await setDoc(docRef, {
                    email: firebaseUser.email,
                    photoURL: firebaseUser.photoURL,
                    firstName: firebaseUser.displayName?.split(" ")[0] || "",
                    lastName: firebaseUser.displayName?.split(" ").slice(1).join(" ") || "",
                    createdAt: new Date().toISOString(),
                    generationsUsed: 0,
                });

                if (firebaseUser.email) {
                    await registerCollegeIfEdu(firebaseUser.email);
                }
            }

            toast.success("Successfully logged in!");
            router.push("/dashboard");
        } catch (error: any) {
            console.error(error);
            toast.error("Login Restricted", {
                description: error.message
            });
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            toast.success("Logged out");
            router.push("/login");
        } catch (error) {
            console.error(error);
            toast.error("Failed to logout");
        }
    };

    const updateUserProfile = async (data: Partial<UserProfile>) => {
        if (!user) return;
        try {
            const docRef = doc(db, "users", user.uid);
            await setDoc(docRef, data, { merge: true });
            setUserProfile(prev => ({ ...prev, ...data }));
            toast.success("Profile updated");
        } catch (error: any) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, signInWithGoogle, logout, updateUserProfile, refreshGenerations }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
