import * as admin from 'firebase-admin';
import { NextRequest } from 'next/server';

// Initialize Firebase Admin if it hasn't been initialized yet
if (!admin.apps.length) {
    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } else {
            console.warn("FIREBASE_SERVICE_ACCOUNT_KEY is missing from environment variables.");
            // We can't initialize without credentials in most environments, but we try default if possible
            admin.initializeApp();
        }
    } catch (error) {
        console.error('Firebase admin initialization error', error);
    }
}

export const adminAuth = admin.apps.length > 0 ? admin.auth() : null;
export const adminDb = admin.apps.length > 0 ? admin.firestore() : null;

/**
 * Extracts and verifies the Firebase ID token from the Authorization header.
 * Returns the decoded UID if valid, otherwise returns null.
 */
export async function verifyAuthToken(req: NextRequest): Promise<string | null> {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        const token = authHeader.split(" ")[1];
        if (!token) return null;

        if (!adminAuth) {
            console.error("Firebase Admin SDK is not initialized properly. Missing FIREBASE_SERVICE_ACCOUNT_KEY?");
            return null;
        }

        const decodedToken = await adminAuth.verifyIdToken(token);
        return decodedToken.uid;
    } catch (error) {
        console.error("Error verifying auth token:", error);
        return null; // Token is invalid or expired
    }
}
