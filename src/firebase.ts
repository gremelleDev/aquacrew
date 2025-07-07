// src/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { getFirestore, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '../firebaseConfig';

// Initialize Firebase if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const authInstance = getAuth(app);  // Changed back to authInstance
export const db = getFirestore(app);

// Export serverTimestamp instead of FieldValue
export { serverTimestamp };

/**
 * Note for Sr. Dev:
 * These are the core authentication functions. They are kept separate
 * from the UI components to maintain a clean separation of concerns.
 * They include basic error handling and will be called from the
 * sign-in/sign-up screens.
 */

// Function to sign up a new user
export const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error };
  }
};

// Function to sign in an existing user
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error };
  }
};