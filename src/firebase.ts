// src/firebase.ts
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { firebaseConfig } from '../firebaseConfig';

// Initialize Firebase if it hasn't been initialized yet
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const db = firestore(); // The database instance
export const authInstance = auth();
export const FieldValue = firestore.FieldValue; // The static FieldValue
export default firebase;

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
    const userCredential = await authInstance.createUserWithEmailAndPassword(email, password);
    // We can access the user object here if needed: userCredential.user
    return { user: userCredential.user, error: null };
  } catch (error) {
    // Return the error object for the UI to handle
    return { user: null, error: error };
  }
};

// Function to sign in an existing user
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await authInstance.signInWithEmailAndPassword(email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error };
  }
};