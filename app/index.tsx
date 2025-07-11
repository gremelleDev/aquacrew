// app/index.tsx
import { authInstance } from '../src/firebase';
import { useAuthStore } from '../src/stores/useAuthStore';
import { Redirect } from 'expo-router'; 
import React, { useState } from 'react';
import { Text, TouchableOpacity, View, Modal, ActivityIndicator } from 'react-native';
import { styles } from '../src/styles/appStyles';
import { Feather } from '@expo/vector-icons';
import CircularProgress from '../src/components/CircularProgress';
import MilestoneModal from '../src/components/MilestoneModal';
import UsageDashboard from '../src/components/UsageDashboard';
import { useWaterTracking } from '../src/hooks/useWaterTracking';
import { useMilestones } from '../src/hooks/useMilestones';

export default function Index() {
  // Get the current user from our global store
  const isLoading = useAuthStore((state) => state.isLoading);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const profile = useAuthStore((state) => state.profile);

  // Initialize hooks before any early returns
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  
  // Use our custom hooks for clean separation of concerns
  const { 
    dailyGoal, 
    currentIntake, 
    progress, 
    currentStreak, 
    isSubmitting, 
    addWater 
  } = useWaterTracking();

  const { 
    showMilestoneModal, 
    currentMilestone, 
    handleMilestoneClose 
  } = useMilestones();

  // Authentication and routing checks - handle these before rendering the main app
  
  // Show loading spinner while Firebase checks authentication state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Redirect to sign-in if user is not authenticated
  if (!isLoggedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // Redirect to onboarding if user hasn't completed profile setup
  if (!profile?.onboardingComplete) {
    return <Redirect href="/(onboarding)/setup" />;
  }



  // Function to handle the sign-out press
  const onSignOutPressed = () => {
    authInstance.signOut();
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
        onPress={() => setIsMenuVisible(true)}
        className="bg-white p-2 rounded-full shadow"
      >
        <Feather name="settings" size={24} color="#343A40" />
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
          {/* Add this new View for the streak */}
          <View className="flex-row items-center mt-2">
            <Text className="text-lg font-bold text-coral-accent">{currentStreak}</Text>
            <Text className="text-lg text-coral-accent ml-1">🔥</Text>
          </View>
      </CircularProgress>
    </View>

    {/* Add Water Button */}
    <TouchableOpacity 
      style={styles.fab}
      onPress={() => addWater()}
      disabled={isSubmitting}
    >
      <Feather name="plus" size={32} color="white" />
    </TouchableOpacity>

    {/* Settings Menu Modal */}
    <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPressOut={() => setIsMenuVisible(false)}>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => {
                setIsMenuVisible(false);
                onSignOutPressed();
              }}
            >
              <Text style={styles.menuButtonText}>Log Out</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setIsMenuVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      {/* Milestone Celebration Modal */}
      <MilestoneModal
        visible={showMilestoneModal}
        milestone={currentMilestone}
        onClose={handleMilestoneClose}
      />
      
      {/* Usage Dashboard (Development Only) */}
      <UsageDashboard />
  </View>
  );
}