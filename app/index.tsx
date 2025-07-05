import { Link } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center bg-gray-100">
  <Text className="text-xl mb-4">AquaCrew Root</Text>
  <Link href="/(auth)/sign-in" className="text-blue-500 text-lg">
    Go to Sign In
  </Link>
</View>
  );
}
