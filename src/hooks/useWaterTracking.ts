// src/hooks/useWaterTracking.ts
import { useState, useEffect } from 'react';
import { doc, setDoc, increment, onSnapshot } from 'firebase/firestore';
import { Alert } from 'react-native';
import { db } from '../firebase';
import { useAuthStore } from '../stores/useAuthStore';

interface DailyProgress {
  currentIntake: number;
}

export function useWaterTracking() {
  const profile = useAuthStore((state) => state.profile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>({ currentIntake: 0 });

  // Listen for real-time updates to today's progress
  useEffect(() => {
    if (!profile) return;

    const today = new Date().toISOString().split('T')[0];
    const progressDocRef = doc(db, 'users', profile.uid, 'daily_progress', today);

    const unsubscribe = onSnapshot(progressDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setDailyProgress({ currentIntake: docSnap.data().currentIntake || 0 });
      } else {
        setDailyProgress({ currentIntake: 0 });
      }
    });

    return () => unsubscribe();
  }, [profile]);

  const addWater = async (amount?: number) => {
    const waterAmount = amount || 250;
    if (!profile) return;

    const dailyGoal = profile.hydrationGoal || 2000;
    const currentIntake = dailyProgress.currentIntake;

    if (currentIntake >= dailyGoal) {
      Alert.alert("Daily Goal Reached!", "Great job!");
      return;
    }

    setIsSubmitting(true);

    const today = new Date().toISOString().split('T')[0];
    const progressDocRef = doc(db, 'users', profile.uid, 'daily_progress', today);

    try {
      await setDoc(progressDocRef, { 
        currentIntake: increment(waterAmount) 
      }, { merge: true });
    } catch (error) {
      console.error("Failed to log water:", error);
      Alert.alert('Error', 'Failed to log water. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate progress data
  const dailyGoal = profile?.hydrationGoal || 2000;
  const currentIntake = dailyProgress.currentIntake;
  const progress = dailyGoal > 0 ? Math.min(currentIntake / dailyGoal, 1) : 0;
  const currentStreak = profile?.currentStreak || 0;

  return {
    dailyGoal,
    currentIntake,
    progress,
    currentStreak,
    isSubmitting,
    addWater
  };
}