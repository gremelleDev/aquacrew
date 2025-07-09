// app/_layout.tsx

// This import must be at the very top
import 'expo-dev-client';

import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { useEffect } from 'react';
import { authInstance,db } from '../src/firebase'; // Import our auth instance
import { useAuthStore, type UserProfile } from '../src/stores/useAuthStore'; // Import our store


export default function RootLayout() {
  // Get the setUser action from our auth store
  const { setProfile, isLoading, isLoggedIn, profile } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();     
  
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
    }, [setProfile]); // Dependency array is unchanged

  // This useEffect hook handles all navigation logic.
  // It runs whenever the user's login status or the current screen changes. 
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    // The user is logged in but hasn't completed onboarding
    if (isLoggedIn && !profile?.onboardingComplete && !inOnboardingGroup) {
      router.replace('/(onboarding)');
    } 
    // The user is logged in AND has completed onboarding
    else if (isLoggedIn && profile?.onboardingComplete && (inAuthGroup || inOnboardingGroup)) {
      router.replace('/');
    } 
    // The user is not logged in
    else if (!isLoggedIn && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    }
  }, [isLoading, isLoggedIn, profile, segments, router]);

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