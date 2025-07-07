// file: /src/stores/useAuthStore.ts

import { create } from 'zustand';

// Define the shape of our user data.
// We'll expand this later, but for now, we only need the UID.
export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  hydrationGoal: number;
  onboardingComplete: boolean; // The new, important flag
}

// Define the shape of the store's state
interface AuthState {
  profile: UserProfile | null; // Changed from 'user' to 'profile'
  isLoggedIn: boolean;
  isLoading: boolean;
  setProfile: (profile: UserProfile | null) => void; // Changed from 'setUser'
}

// Create the Zustand store
export const useAuthStore = create<AuthState>((set) => ({
  profile: null, // Initially, no user is logged in
  isLoggedIn: false, // Initially, not logged in
  isLoading: true, // Start in a loading state to check for a persisted session
  
  // This is an "action" that updates the state
  setProfile: (profile) => set({ profile, isLoggedIn: !!profile, isLoading: false }),
}));