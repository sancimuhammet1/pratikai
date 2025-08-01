import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithRedirect, 
  getRedirectResult, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  try {
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error("Google login error:", error);
    throw error;
  }
}

export async function handleRedirect() {
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (error) {
    console.error("Redirect result error:", error);
    throw error;
  }
}

export async function loginWithEmail(email: string, password: string) {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Email login error:", error);
    throw error;
  }
}

export async function registerWithEmail(email: string, password: string) {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Email registration error:", error);
    throw error;
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
}
