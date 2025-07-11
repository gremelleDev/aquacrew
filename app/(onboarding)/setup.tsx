//app/(onboarding)/setup.tsx
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../src/firebase';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function OnboardingScreen() {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);  
  //console.log('🔍 Onboarding sees profile:', profile?.onboardingComplete); 
  // Debug line 1
  //console.log('🔍 Onboarding full profile:', profile); 
  // Debug line 2
  const [username, setUsername] = useState('');
  const [hydrationGoal, setHydrationGoal] = useState('2000'); // Default 2000ml
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.onboardingComplete) {
      console.log('🎉 Onboarding complete detected, navigating to home');
      router.replace('/');
    }
  }, [profile?.onboardingComplete, router]);

  const onContinuePressed = async () => {
    console.log('🔍 Continue pressed, profile:', profile); // Debug line 3

    if (!profile) {
      console.log('🔍 No profile found!'); // Debug line 4
      Alert.alert('Error', 'No user profile found.');
      return;
    }

    if (!username.trim() || !hydrationGoal.trim()) {
      Alert.alert('Missing Information', 'Please fill out all fields.');
      return;
    }

    const goal = parseInt(hydrationGoal, 10);
    if (isNaN(goal) || goal <= 0) {
      Alert.alert('Invalid Goal', 'Please enter a valid number for your hydration goal.');
      return;
    }

    setLoading(true);

    try {
      const userDocRef = doc(db, 'users', profile.uid);
      await updateDoc(userDocRef, {
        username: username.trim(),
        hydrationGoal: goal,
        onboardingComplete: true, // This completes the onboarding!
        // Initialize streak fields when user completes profile setup
        currentStreak: 0,
        longestStreak: 0,
        lastGoalAchievedDate: '',
        unviewedMilestones: []
      });
      // The redirection will happen automatically from our _layout.tsx

      
    } catch (e) {
      console.error("Error updating document: ", e);
      Alert.alert('Error', 'Could not save your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white p-4">
      <Text className="text-4xl font-bold mb-2 text-gray-800">Welcome to AquaCrew!</Text>
      <Text className="text-lg mb-8 text-gray-600">Let's set up your profile.</Text>

      {/* Username Input */}
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Choose a Username"
        className="w-4/5 bg-gray-100 border border-gray-300 rounded-lg p-4 mb-4 text-lg text-gray-900 placeholder:text-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"        
        autoCapitalize="words"
      />

      {/* Hydration Goal Input */}
      <TextInput
        value={hydrationGoal}
        onChangeText={setHydrationGoal}
        placeholder="Daily Hydration Goal (in ml)"
        className="w-4/5 bg-gray-100 border border-gray-300 rounded-lg p-4 mb-4 text-lg text-gray-900 placeholder:text-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"        
        keyboardType="number-pad"
      />

      {/* Continue Button */}
      <TouchableOpacity
        onPress={onContinuePressed}
        disabled={loading}
        className="w-4/5 bg-refresh-blue p-4 rounded-lg items-center mt-4"
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-lg">Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}