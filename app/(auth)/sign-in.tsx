// app/(auth)/sign-in.tsx

import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { signIn } from '../../src/firebase'; // Import our new function

/**
 * Note for Sr. Dev:
 * This is the initial UI scaffold for the Sign-In screen.
 * - State is managed with basic `useState` for form inputs.
 * - Styling is done via NativeWind utility classes.
 * - The "Sign In" button currently only logs to the console.
 * - Firebase auth logic will be added in a subsequent step.
 */
export default function SignInScreen() {
  // State for the email and password input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Add this line
  const router = useRouter();


  // Function for the sign-in button press
  const onSignInPressed = async () => {
    setLoading(true); // Start loading
    try {
      const { user, error } = await signIn(email, password);
  
      if (error) {
        // This checks if the error object exists and has a message property before trying to access it.
        Alert.alert('Sign In Error', (error as any)?.message || 'An unknown error occurred.');
      } else {
        // For now, we'll just log success.
        // In a future step, we'll redirect the user.
        if (user) {
            // We'll redirect from here in a future step
            router.replace('/');
            console.log('User signed in successfully!', user.uid);        
          }
      }
    } catch (e) {
      // Catch any other unexpected errors
      Alert.alert('Sign In Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false); // Stop loading, regardless of outcome
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white p-4">
      <Text className="text-4xl font-bold mb-8 text-gray-800">Welcome Back</Text>

      {/* Email Input */}
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        className="w-4/5 bg-gray-100 border border-gray-300 rounded-lg p-4 mb-4 text-lg text-gray-900 placeholder:text-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Input */}
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        className="w-4/5 bg-gray-100 border border-gray-300 rounded-lg p-4 mb-4 text-lg text-gray-900 placeholder:text-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"        secureTextEntry // Hides the password input
      />

      {/* Sign In Button */}
      <TouchableOpacity
        onPress={onSignInPressed}
        disabled={loading} // Disable button when loading
        className="w-4/5 bg-blue-500 p-4 rounded-lg items-center mt-4">
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-lg">Sign In</Text>
        )}
      </TouchableOpacity>

      {/* Link to Sign Up Screen */}
      <Link href="/(auth)/sign-up" asChild>
        <TouchableOpacity className="mt-6">
          <Text className="text-blue-500">Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}