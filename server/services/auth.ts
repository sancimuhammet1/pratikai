import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Initialize Firebase Admin SDK only if credentials are available
let auth: any = null;

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }

  auth = getAuth();
}

export interface DecodedToken {
  uid: string;
  email?: string;
  name?: string;
}

export async function verifyIdToken(idToken: string): Promise<DecodedToken> {
  if (!auth) {
    throw new Error("Firebase Admin SDK not initialized. Please provide Firebase credentials.");
  }
  
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    throw new Error("Invalid authentication token");
  }
}

export async function requireAuth(req: any): Promise<DecodedToken> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error("No authentication token provided");
  }

  const idToken = authHeader.split('Bearer ')[1];
  return await verifyIdToken(idToken);
}
