// app/index.tsx
import { authInstance,db } from '../src/firebase';
import { useAuthStore } from '../src/stores/useAuthStore';
import React, {useEffect, useState} from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from './styles';
import { Feather } from '@expo/vector-icons';
import CircularProgress from '../src/components/CircularProgress';
import { doc, setDoc, increment, onSnapshot } from 'firebase/firestore';

export default function Index() {
  // Get the current user from our global store
  const profile = useAuthStore((state) => state.profile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dailyProgress, setDailyProgress] = useState({ currentIntake: 0 });

  // Add this useEffect for testing
  useEffect(() => {
    console.log('🔥 Firebase Auth connected:', !!authInstance);
    console.log('👤 Current user:', authInstance.currentUser?.email || 'Not logged in');
    console.log('📱 Profile from store:', profile);
  }, [profile]);

  // This useEffect hook listens for real-time updates to today's progress
  useEffect(() => {
    if (!profile) return;

    const today = new Date().toISOString().split('T')[0];
    const progressDocRef = doc(db, 'users', profile.uid, 'daily_progress', today);

    // onSnapshot returns an "unsubscribe" function
    const unsubscribe = onSnapshot(progressDocRef, (docSnap) => {
      if (docSnap.exists()) {
        // If the document exists, update our state
        setDailyProgress({ currentIntake: docSnap.data().currentIntake || 0 });
      } else {
        // If the document doesn't exist (e.g., first drink of the day), reset to 0
        setDailyProgress({ currentIntake: 0 });
      }
    });

    // Cleanup: unsubscribe from the listener when the component unmounts
    return () => unsubscribe();
  }, [profile]); // Rerun this effect if the user profile changes

  // daily goal monitoring
  const dailyGoal = profile?.hydrationGoal || 2000;
  const currentIntake = dailyProgress.currentIntake;
  const progress = dailyGoal > 0 ? currentIntake / dailyGoal : 0;

  // Function to handle the sign-out press
  const onSignOutPressed = () => {
    authInstance.signOut();
  };

    const onAddWaterPressed = async () => {
    if (!profile) return; // Make sure we have a user
    setIsSubmitting(true);

    const today = new Date().toISOString().split('T')[0]; // Gets date in YYYY-MM-DD format
    const progressDocRef = doc(db, 'users', profile.uid, 'daily_progress', today);

    try {
      // Use setDoc with merge:true to create or update the document.
      // Use increment to safely add to the existing value.
      await setDoc(progressDocRef, { 
        currentIntake: increment(250) 
      }, { merge: true });
    } catch (e) {
      console.error("Failed to log water:", e);
      // You could add an Alert here if you want
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-soft-gray p-6 pt-14">
    {/* Header */}
    <View className="flex-row justify-between items-center">
      <View>
        <Text className="text-3xl font-bold text-charcoal-text">
          Hi, {profile?.username || 'User'}!
        </Text>
      </View>
      <TouchableOpacity
        onPress={onSignOutPressed}
        className="flex-row items-center bg-white p-2 rounded-full shadow"
      >
        <Text className="text-charcoal-text font-bold mr-2">
          Streak: 7
        </Text>
        <Text>🔥</Text>
      </TouchableOpacity>
    </View>

    {/* Progress Circle */}
    <View className="flex-1 justify-center items-center">
      <CircularProgress
        size={280}
        strokeWidth={30}
        progress={progress}
        backgroundColor="#E6F4F1"
        progressColor="#00ADEF"
      >
        <Text className="text-5xl font-extrabold text-charcoal-text">
          {Math.round(progress * 100)}%
        </Text>
        <Text className="text-lg text-gray-500">
          {currentIntake} / {dailyGoal} ml
        </Text>
      </CircularProgress>
    </View>

    {/* Add Water Button */}
    <TouchableOpacity 
      style={styles.fab}
      onPress={onAddWaterPressed}
      disabled={isSubmitting}
    >
      <Feather name="plus" size={32} color="white" />
    </TouchableOpacity>
  </View>
  );
}