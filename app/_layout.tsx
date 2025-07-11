// app/_layout.tsx

// This import must be at the very top
import 'expo-dev-client';

import { doc, onSnapshot } from 'firebase/firestore';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { useEffect } from 'react';
import { authInstance,db } from '../src/firebase'; // Import our auth instance
import { useAuthStore, type UserProfile } from '../src/stores/useAuthStore'; // Import our store
import { useUsageMonitor } from '../src/hooks/useUsageMonitor';


export default function RootLayout() {
  // Get the setUser action from our auth store
  const { setProfile, isLoading } = useAuthStore();
  const { incrementUsage } = useUsageMonitor();

  
  // This useEffect hook sets up the Firebase auth listener.
  // It runs only once when the app starts.
    // useEffect with real-time listener
    useEffect(() => {
      // This will hold the unsubscribe function for the profile listener
      let unsubscribeFromProfile: () => void = () => {};

      // This listener handles auth state changes (login/logout)
      const unsubscribeFromAuth = authInstance.onAuthStateChanged(user => {
        // Unsubscribe from any old profile listener
        unsubscribeFromProfile();

        if (user) {
          // If user is logged in, set up a real-time listener for their profile
          const userDocRef = doc(db, 'users', user.uid);
          unsubscribeFromProfile = onSnapshot(userDocRef, (docSnap) => {
            // Track Firestore read operation
            incrementUsage('reads', 1);
            
            if (docSnap.exists()) {
              const userProfile = {
                uid: user.uid,
                ...docSnap.data(),
              } as UserProfile;
              setProfile(userProfile);
            } else {
              console.warn('User exists in Auth, but not in Firestore.');
              setProfile(null);
            }
          });
        } else {
          // User is logged out
          setProfile(null);
        }
      });

      // Final cleanup function runs when the app closes
      return () => {
        unsubscribeFromAuth();
        unsubscribeFromProfile();
      };
    }, [setProfile, incrementUsage]); // Dependency array is unchanged


  if (isLoading) {
    // Show a loading indicator while we check for a logged-in user
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // This is the root layout for the entire app.
  return (
    <>
      <Stack>
        {/* The '(auth)' group contains our sign-in/sign-up screens. */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        {/* The '(onboarding)' group contains our profile setup screen. */}
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        {/* The main app screen. */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}