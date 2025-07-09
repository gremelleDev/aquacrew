// src/hooks/useMilestones.ts
import { useState, useEffect } from 'react';
import { doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuthStore } from '../stores/useAuthStore';

export function useMilestones() {
  const profile = useAuthStore((state) => state.profile);
  const { setProfile } = useAuthStore();
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<string>('');

  // Check for unviewed milestones when profile changes
  useEffect(() => {
    if (profile?.unviewedMilestones && profile.unviewedMilestones.length > 0) {
      const milestone = profile.unviewedMilestones[0];
      setCurrentMilestone(milestone);
      setShowMilestoneModal(true);
    }
  }, [profile?.unviewedMilestones]);

  const handleMilestoneClose = async () => {
    if (!profile || !currentMilestone) return;

    try {
      // Remove the viewed milestone from Firebase
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        unviewedMilestones: arrayRemove(currentMilestone)
      });

      // Update local state
      const updatedProfile = {
        ...profile,
        unviewedMilestones: profile.unviewedMilestones.filter(m => m !== currentMilestone)
      };
      setProfile(updatedProfile);

    } catch (error) {
      console.error('Failed to mark milestone as viewed:', error);
    }

    setShowMilestoneModal(false);
    setCurrentMilestone('');
  };

  return {
    showMilestoneModal,
    currentMilestone,
    handleMilestoneClose
  };
}