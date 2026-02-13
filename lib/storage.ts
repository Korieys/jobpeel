import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadResume(userId: string, file: File) {
    try {
        const timestamp = Date.now();
        const filename = `${timestamp}_${file.name}`;
        const storageRef = ref(storage, `users/${userId}/resumes/${filename}`);

        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        return {
            url: downloadURL,
            path: snapshot.ref.fullPath,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString()
        };
    } catch (error) {
        console.error("Error uploading resume:", error);
        throw error;
    }
}
