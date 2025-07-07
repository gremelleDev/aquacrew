// app/_layout.tsx

// This import must be at the very top
import 'expo-dev-client';

import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { useEffect } from 'react';
import { authInstance,db } from '../src/firebase'; // Import our auth instance
import { useAuthStore, type UserProfile } from '../src/stores/useAuthStore'; // Import our store


export default function RootLayout() {
  // Get the setUser action from our auth store
  const { setProfile, isLoading, isLoggedIn } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();     
  
  // This useEffect hook sets up the Firebase auth listener.
  // It runs only once when the app starts.
  useEffect(() => {
    // onAuthStateChanged returns an "unsubscribe" function.
    const unsubscribe = authInstance.onAuthStateChanged(async (user) => {
      if (user) {
        // User is logged in, now fetch their profile from Firestore.
        const userDocRef = db.collection('users').doc(user.uid);
        const docSnap = await userDocRef.get();
  
        if (docSnap.exists()) {
          // User profile found in Firestore, set it in the store.
          const userProfile = docSnap.data() as UserProfile;
          setProfile(userProfile);
        } else {
          // This is a rare case, e.g., user exists in Auth but not Firestore.
          // For now, treat them as logged out. We can handle this case later.
          console.warn('User exists in Auth, but not in Firestore.');
          setProfile(null);
        }
      } else {
        // User is logged out.
        setProfile(null);
      }
    });
  
    // Cleanup function.
    return () => unsubscribe();
  }, [setProfile]);

  // This useEffect hook handles all navigation logic.
  // It runs whenever the user's login status or the current screen changes.
  useEffect(() => {
    // Don't run this logic until the initial loading is complete.
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isLoggedIn && inAuthGroup) {
      // If the user is logged in, but somehow on a sign-in/sign-up screen,
      // redirect them to the main app home screen.
      router.replace('/');
    } else if (!isLoggedIn && !inAuthGroup) {
      // If the user is NOT logged in and is NOT on an auth screen,
      // redirect them to the sign-in screen.
      router.replace('/(auth)/sign-in');
    }
  }, [isLoading, isLoggedIn, segments, router]);

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
        {/* The main app screen. */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}