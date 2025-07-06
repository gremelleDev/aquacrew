// app/_layout.tsx

// This import must be at the very top
import 'expo-dev-client';

import { Stack, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { useEffect } from 'react';
import { authInstance } from '../src/firebase'; // Import our auth instance
import { useAuthStore } from '../src/stores/useAuthStore'; // Import our store


export default function RootLayout() {
  // Get the setUser action from our auth store
  const { setUser } = useAuthStore();
  const isLoading = useAuthStore((state) => state.isLoading);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  
  // This useEffect hook sets up the Firebase auth listener.
  // It runs only once when the app starts.
  useEffect(() => {
    // onAuthStateChanged returns an "unsubscribe" function.
    const unsubscribe = authInstance.onAuthStateChanged((user) => {
      // When the auth state changes (login/logout), we update our global store.
      if (user) {
        // User is logged in. We only need the uid for now.
        setUser({ uid: user.uid });
      } else {
        // User is logged out.
        setUser(null);
      }
    });

    // The cleanup function will be called when the component unmounts.
    // This prevents memory leaks.
    return () => unsubscribe();
  }, [setUser]); // The hook depends on the setUser function.

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
      <Stack screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          // If logged in, show the main app screen (index).
          <Stack.Screen name="index" />
        ) : (
          // If not logged in, show the auth screens.
      <Stack.Screen name="(auth)" />
        )}
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}