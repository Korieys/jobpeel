"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    User,
    GoogleAuthProvider
} from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface UserProfile {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: string;
    photoURL?: string;
    bio?: string;
}

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                // Fetch user profile from Firestore
                try {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setUserProfile(docSnap.data() as UserProfile);
                    } else {
                        // Init profile from Auth data if not in DB
                        const newProfile = {
                            email: user.email || "",
                            photoURL: user.photoURL || "",
                            firstName: user.displayName?.split(" ")[0] || "",
                            lastName: user.displayName?.split(" ").slice(1).join(" ") || ""
                        };
                        setUserProfile(newProfile);
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                }
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // 1. Check Waitlist Status
            // Query jobpeel_waitlist for this email OR domain
            const { collection, query, where, getDocs } = await import("firebase/firestore");
            const waitlistRef = collection(db, "jobpeel_waitlist");

            // A. Check Direct Email
            const qEmail = query(waitlistRef, where("work_email", "==", user.email));
            const snapEmail = await getDocs(qEmail);

            let isApproved = false;
            snapEmail.forEach((doc) => {
                if (doc.data().status === "approved") isApproved = true;
            });

            // B. Check Domain (if not already approved)
            if (!isApproved && user.email) {
                const domain = user.email.split('@')[1];
                if (domain) {
                    const qDomain = query(waitlistRef, where("domains", "array-contains", domain));
                    const snapDomain = await getDocs(qDomain);
                    snapDomain.forEach((doc) => {
                        if (doc.data().status === "approved") isApproved = true;
                    });
                }
            }

            // C. Check Admin Emails (if not already approved)
            if (!isApproved && user.email) {
                const qAdmin = query(waitlistRef, where("admin_emails", "array-contains", user.email));
                const snapAdmin = await getDocs(qAdmin);
                snapAdmin.forEach((doc) => {
                    if (doc.data().status === "approved") isApproved = true;
                });
            }

            if (!isApproved) {
                await signOut(auth);
                throw new Error("Your account is pending approval. Please join the waitlist or wait for your acceptance email.");
            }

            // 2. Check if user exists in DB, if not create basic profile
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                await setDoc(docRef, {
                    email: user.email,
                    photoURL: user.photoURL,
                    firstName: user.displayName?.split(" ")[0] || "",
                    lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
                    createdAt: new Date().toISOString()
                });
            }

            toast.success("Successfully logged in!");
            router.push("/dashboard");
        } catch (error: any) {
            console.error(error);
            // Ensure we don't leave a session if it failed logic (already handled by signOut above for approval, but good specific catch)
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
        <AuthContext.Provider value={{ user, userProfile, loading, signInWithGoogle, logout, updateUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
