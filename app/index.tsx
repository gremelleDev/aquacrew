// app/index.tsx
import { authInstance } from '../src/firebase';
import { useAuthStore } from '../src/stores/useAuthStore';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
  // Get the current user from our global store
  const user = useAuthStore((state) => state.user);

  // Function to handle the sign-out press
  const onSignOutPressed = () => {
    authInstance.signOut();
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 p-4">
      <Text className="text-2xl font-bold mb-4">Welcome to AquaCrew!</Text>
      
      {/* Display the user's UID if they are logged in */}
      <Text className="text-lg mb-8">
        {user ? `Logged in as: ${user.uid}` : 'Not logged in'}
      </Text>

      {/* Sign Out Button */}
      <TouchableOpacity
        onPress={onSignOutPressed}
        className="bg-coral-accent p-4 rounded-lg items-center w-4/5">
        <Text className="text-white font-bold text-lg">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}