// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  // This layout file is only for grouping the auth screens.
// The main app/_layout.tsx handles all redirection logic.

  // If the user is not logged in, show the sign-in/sign-up screens.
  return <Stack screenOptions={{ headerShown: false }} />;
}