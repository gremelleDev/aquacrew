// src/hooks/useWaterTracking.ts
import { useState, useEffect } from 'react';
import { doc, setDoc, increment, onSnapshot } from 'firebase/firestore';
import { Alert } from 'react-native';
import { db } from '../firebase';
import { useAuthStore } from '../stores/useAuthStore';
import { useUsageMonitor } from './useUsageMonitor';

interface DailyProgress {
  currentIntake: number;
}

export function useWaterTracking() {
  const profile = useAuthStore((state) => state.profile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>({ currentIntake: 0 });
  const { incrementUsage, wouldExceedLimit, getAlertLevel } = useUsageMonitor();

  // Listen for real-time updates to today's progress
  useEffect(() => {
    if (!profile) return;

    const today = new Date().toISOString().split('T')[0];
    const progressDocRef = doc(db, 'users', profile!.uid, 'daily_progress', today);

    const unsubscribe = onSnapshot(progressDocRef, (docSnap) => {
      // Track Firestore read operation
      incrementUsage('reads', 1);
      
      if (docSnap.exists()) {
        setDailyProgress({ currentIntake: docSnap.data().currentIntake || 0 });
      } else {
        setDailyProgress({ currentIntake: 0 });
      }
    });

    return () => unsubscribe();
  }, [profile, incrementUsage]);

  const addWater = async (amount?: number) => {
    const waterAmount = amount || 250;
    if (!profile) return;

    const dailyGoal = profile.hydrationGoal || 2000;
    const currentIntake = dailyProgress.currentIntake;

    if (currentIntake >= dailyGoal) {
      Alert.alert("Daily Goal Reached!", "Great job!");
      return;
    }

    // Check usage limits before proceeding
    const alertLevel = getAlertLevel();
    
    // Show warning if in danger zone
    if (alertLevel === 'danger') {
      Alert.alert(
        'Firebase Usage Warning',
        'Your app is approaching daily Firebase limits. This action will still proceed, but consider reducing usage to avoid potential costs.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => performAddWater(waterAmount) }
        ]
      );
      return;
    }

    // Check if write operation would exceed limits
    if (wouldExceedLimit('writes', 1)) {
      Alert.alert(
        'Daily Limit Reached',
        'You\'ve reached the daily Firebase usage limit. Please try again tomorrow!',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    await performAddWater(waterAmount);
  };

  const performAddWater = async (waterAmount: number) => {
    setIsSubmitting(true);

    const today = new Date().toISOString().split('T')[0];
    const progressDocRef = doc(db, 'users', profile!.uid, 'daily_progress', today);

    try {
      // Check if we can proceed with the write operation
      const canProceed = await incrementUsage('writes', 1);
      if (!canProceed) {
        Alert.alert('Daily Limit Reached', 'You\'ve reached the daily Firebase usage limit. Please try again tomorrow!');
        return;
      }

      await setDoc(progressDocRef, { 
        currentIntake: increment(waterAmount) 
      }, { merge: true });

      // Track the Cloud Function execution that will be triggered
      await incrementUsage('functions', 1);
      
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