import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

export const joinWaitlist = async (email: string, name: string = "") => {
    const toastId = toast.loading("Adding to waitlist...");

    try {
        // Add to Firestore
        await addDoc(collection(db, "jobpeel_waitlist"), {
            program_name: "Auto-Joined",
            contact_name: name || "Pilot Applicant",
            work_email: email,
            program_type: "Other",
            status: "pending",
            source: "login_auto_join",
            created_at: serverTimestamp()
        });

        // Trigger Welcome Email
        await fetch('/api/waitlist/welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                name: name || "Pilot Applicant"
            })
        });

        toast.success("Welcome onto the waitlist!", {
            id: toastId,
            description: "We've sent you a confirmation email."
        });
    } catch (error) {
        console.error("Error joining waitlist:", error);
        toast.error("Failed to join waitlist", {
            id: toastId,
            description: "Please try again or use the form on the landing page."
        });
    }
};
