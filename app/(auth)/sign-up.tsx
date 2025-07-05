// app/(auth)/sign-up.tsx

import { Link } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { signUp, db, FieldValue } from '../../src/firebase'; // Import signUp and firestore

/**
 * Note for Sr. Dev:
 * This is the initial UI scaffold for the Sign-Up screen.
 * - State is managed with basic `useState` for form inputs.
 * - Styling is done via NativeWind utility classes.
 * - The "Sign Up" button currently only logs to the console.
 * - Firebase auth logic (createUserWithEmailAndPassword) and Firestore user
 *   document creation will be added in a subsequent step.
 */
export default function SignUpScreen() {
  // State for the form inputs
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Add this line

  // Function for the sign-up button press
  const onSignUpPressed = async () => {
    // Basic validation
    if (!username || !email || !password) {
      Alert.alert('Missing Information', 'Please fill out all fields.');
      return;
    }
    setLoading(true);
    try {
      // 1. Create the user in Firebase Auth
      const { user, error: authError } = await signUp(email, password);
  
      if (authError) {
        Alert.alert('Sign Up Error', (authError as any)?.message || 'An authentication error occurred.');
        setLoading(false);
        return; // Stop if auth fails
      }
  
      if (user) {
        // 2. Create the user document in Firestore with the user's UID
        await db.collection('users').doc(user.uid).set({
            username: username,
            email: email,
            hydrationGoal: 2000, // Default goal (2L), as per PRD
            createdAt: FieldValue.serverTimestamp(),
        });
  
        console.log('User signed up and profile created!', user.uid);
        // In a future step, we'll redirect the user.
      }
    } catch (e) {
      Alert.alert('Sign Up Error', (e as any)?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white p-4">
      <Text className="text-4xl font-bold mb-8 text-gray-800">Create Account</Text>

      {/* Username Input */}
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        className="w-4/5 bg-gray-100 border border-gray-300 rounded-lg p-4 mb-4 text-lg"
        autoCapitalize="none"
      />

      {/* Email Input */}
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        className="w-4/5 bg-gray-100 border border-gray-300 rounded-lg p-4 mb-4 text-lg"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Input */}
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        className="w-4/5 bg-gray-100 border border-gray-300 rounded-lg p-4 mb-4 text-lg"
        secureTextEntry // Hides the password input
      />

      {/* Sign Up Button */}
      <TouchableOpacity
        onPress={onSignUpPressed}
        disabled={loading} // Disable button when loading
        className="w-4/5 bg-blue-500 p-4 rounded-lg items-center mt-4">
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-lg">Sign Up</Text>
        )}
      </TouchableOpacity>

      {/* Link to Sign In Screen */}
      <Link href="/(auth)/sign-in" asChild>
        <TouchableOpacity className="mt-6">
          <Text className="text-blue-500">Already have an account? Sign In</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}