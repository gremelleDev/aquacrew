// file: /src/stores/useAuthStore.ts

import { create } from 'zustand';

// Define the shape of our user data.
// We'll expand this later, but for now, we only need the UID.
interface User {
  uid: string;
}

// Define the shape of the store's state
interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
}

// Create the Zustand store
export const useAuthStore = create<AuthState>((set) => ({
  user: null, // Initially, no user is logged in
  isLoggedIn: false, // Initially, not logged in
  isLoading: true, // Start in a loading state to check for a persisted session
  
  // This is an "action" that updates the state
  setUser: (user) => set({ user, isLoggedIn: !!user, isLoading: false }),
}));