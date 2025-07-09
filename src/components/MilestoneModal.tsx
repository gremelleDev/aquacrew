// src/components/MilestoneModal.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { getMilestoneMessage } from '../utils/milestoneHelpers';

interface MilestoneModalProps {
  visible: boolean;
  milestone: string;
  onClose: () => void;
}

export default function MilestoneModal({ visible, milestone, onClose }: MilestoneModalProps) {
  if (!milestone) return null;

  const milestoneData = getMilestoneMessage(milestone);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-3xl p-8 mx-6 items-center shadow-lg">
          <Text className="text-6xl mb-4">{milestoneData.emoji}</Text>
          <Text className="text-2xl font-bold text-charcoal-text mb-2 text-center">
            {milestoneData.title}
          </Text>
          <Text className="text-lg text-gray-600 mb-6 text-center">
            {milestoneData.message}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            className="bg-refresh-blue px-8 py-3 rounded-full"
          >
            <Text className="text-white font-bold text-lg">Awesome!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}